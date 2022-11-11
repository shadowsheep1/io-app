/**
 * A saga that manages the Profile.
 */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  call,
  put,
  select,
  takeLatest
} from "typed-redux-saga/macro";
import Config from "react-native-config";
import {
  getType
} from "typesafe-actions";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { BackendClient } from "../../../api/backend";
import I18n from "../../../i18n";
import { sessionExpired } from "../../../store/actions/authentication";
import {
  profileLoadFailure,
} from "../../../store/actions/profile";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { readablePrivacyReport } from "../../../utils/reporters";
import {
  sessionTokenSelector
} from "../../../store/reducers/authentication";
import { authenticationSaga } from "../../../sagas/startup/authenticationSaga";
import { initializeProfileRequest } from "../store/actions/profile";

export const environment: string = Config.ENVIRONMENT;
export const apiUrlPrefix: string = Config.API_URL_PREFIX;

// This function listens for Profile refresh requests and calls the needed saga.
export function* initializeProfileRequestsSaga(): Iterator<ReduxSagaEffect> {
  yield* takeLatest(getType(initializeProfileRequest), initializeProfile);
}

export function* initializeProfile(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
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
    // TODO: - Start again if we can't load the profile but wait a while
    console.log("💥 -> profile not loaded");
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
  const response = yield* call(getProfile, {});
  try {
    const backendProfile = pipe(
      response,
      E.foldW(
        reason => { throw Error(readablePrivacyReport(reason)); },
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
        })
    );
    yield* checkBackendProfile(backendProfile);
    return backendProfile;
  } catch (e) {
    yield* put(profileLoadFailure(convertUnknownToError(e)));
  }
  return O.none;
}

function* checkBackendProfile(profile: O.Option<InitializedProfile>) {
  if (O.isSome(profile)) {
    console.log(`🦄 -> ${profile}`);
  } else {
    yield* put(sessionExpired());
  }
}
