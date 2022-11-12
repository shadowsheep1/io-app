/**
 * A saga that manages the Profile.
 */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { delay, call, put, select, takeLatest } from "typed-redux-saga/macro";
import Config from "react-native-config";
import { getType } from "typesafe-actions";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { BackendClient } from "../../../api/backend";
import I18n from "../../../i18n";
import { sessionExpired } from "../../../store/actions/authentication";
import {
  profileLoadFailure,
  profileLoadSuccess
} from "../../../store/actions/profile";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { readablePrivacyReport } from "../../../utils/reporters";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { authenticationSaga } from "../../../sagas/startup/authenticationSaga";
import { initializeProfileRequest } from "../store/actions/profile";

const BACKEND_PROFILE_LOAD_INTERVAL = (6 * 1000) as Millisecond;
const apiUrlPrefix: string = Config.API_URL_PREFIX;

// This function listens for Profile refresh requests and calls the needed saga.
export function* refreshProfileOnMountOfTheNewProfileRequestsSaga(): Iterator<ReduxSagaEffect> {
  yield* takeLatest(getType(initializeProfileRequest), initializeProfile);
}

export function* initializeProfile(): Generator<ReduxSagaEffect, void, any> {
  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<typeof sessionTokenSelector> =
    yield* select(sessionTokenSelector);

  const sessionToken: SagaCallReturnType<typeof authenticationSaga> =
    previousSessionToken
      ? previousSessionToken
      : yield* call(authenticationSaga);

  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken
  );

  // Load the profile info
  const maybeUserProfile: SagaCallReturnType<typeof loadProfile> = yield* call(
    loadProfile,
    backendClient.getProfile
  );

  if (O.isNone(maybeUserProfile)) {
    /**
     * If we didn't succeed, 
     * we try again after waiting some time.
     */
    yield* delay(BACKEND_PROFILE_LOAD_INTERVAL);
    yield* put(initializeProfileRequest());
  }
}

// A saga to load the Profile.
export function* loadProfile(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Generator<
  ReduxSagaEffect,
  O.Option<InitializedProfile>,
  SagaCallReturnType<typeof getProfile>
> {
  try {
    const response = yield* call(getProfile, {});
    const backendProfile = pipe(
      response,
      E.foldW(
        reason => {
          throw Error(readablePrivacyReport(reason));
        },
        response => {
          if (response.status === 200) {
            return O.some(response.value);
          }
          if (response.status === 401) {
            return O.none;
          }
          throw response
            ? Error(`response status ${response.status}`)
            : Error(I18n.t("profile.errors.load"));
        }
      )
    );
    yield* checkBackendProfile(backendProfile);
    return backendProfile;
  } catch (e) {
    if (e === "max-retries") {
      // This comment is useful to be aware of this king of exception.
      // Only for my onboarding purpose [-;
    }
    yield* put(profileLoadFailure(convertUnknownToError(e)));
  }
  return O.none;
}

function* checkBackendProfile(profile: O.Option<InitializedProfile>) {
  if (O.isSome(profile)) {
    yield* put(profileLoadSuccess(profile.value));
  } else {
    yield* put(sessionExpired());
  }
}
