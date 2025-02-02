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
  takeLatest,
} from "typed-redux-saga/macro";
import Config from "react-native-config";
import { getType } from "typesafe-actions";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { BackendClient } from "../../../api/backend";
import { sessionExpired } from "../../../store/actions/authentication";
import {
  profileLoadFailure,
  profileLoadSuccess
} from "../../../store/actions/profile";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { readablePrivacyReport } from "../../../utils/reporters";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { refreshUserProfileDataRequest } from "../store/actions/profile";
import { SessionToken } from "../../../types/SessionToken";
import { profileLoadRequest } from './../../../store/actions/profile';

const apiUrlPrefix: string = Config.API_URL_PREFIX;

// This function listens for Profile refresh requests and calls the needed saga.
export function* refreshProfileOnMountOfTheNewProfilePageSaga(): Iterator<ReduxSagaEffect> {
  yield* takeLatest(getType(refreshUserProfileDataRequest), refreshProfile);
}

export function* refreshProfile(): Generator<ReduxSagaEffect, void, any> {
  // Whether the user is currently logged in.
  const previousSessionToken: ReturnType<typeof sessionTokenSelector> =
    yield* select(sessionTokenSelector);

  let sessionToken: SessionToken;
  if (previousSessionToken as SessionToken) {
    sessionToken = previousSessionToken as SessionToken;
  } else {
    yield* put(sessionExpired());
    return;
  }

  const backendClient: ReturnType<typeof BackendClient> = BackendClient(
    apiUrlPrefix,
    sessionToken
  );

  // Set profile as Loading
  yield* put(profileLoadRequest());

  // Load the profile info
  const maybeUserProfile: SagaCallReturnType<typeof loadProfile> = yield* call(
    loadProfile,
    backendClient.getProfile
  );

  if (O.isNone(maybeUserProfile)) {
    yield* put(profileLoadFailure(
      Error("Profile is None")
    ));
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
          /**
           * Here we comes even when we get a responso with a status error type,
           * different from the ones of our return types.
           * Here for example we manage only:
           * - 200
           * - 400
           * - 401
           * - 429
           * - 500
           */
          throw Error(readablePrivacyReport(reason));
        },
        response => {
          if (response.status === 200) {
            return O.some(response.value);
          }
          if (response.status === 401) {
            return O.none;
          }
          /**
           * Here we come for all other "known" status code: 400, 500.
           * 429 is known, but it seems to be managed differently (by the API client).
           * For example, having a Server Error 500,
           * but the JSON derserializer expect a JSON Body.
           */
          throw Error(`response status ${response.status}`);
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
