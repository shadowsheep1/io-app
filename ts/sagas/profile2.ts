/**
 * A saga that manages the Profile.
 */
import { back } from "@react-navigation/compat/lib/typescript/src/NavigationActions";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  call,
  put,
} from "typed-redux-saga/macro";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { BackendClient } from "../api/backend";
import I18n from "../i18n";
import { sessionExpired } from "../store/actions/authentication";
import {
  profileLoadFailure,
  profileLoadSuccess,
} from "../store/actions/profile";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";
import { readablePrivacyReport } from "../utils/reporters";

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
      E.mapLeft(
        reason => { throw Error(readablePrivacyReport(reason)) }
      ),
      E.foldW(
        reason => { throw Error(reason) },
        response => {
        if (response.status === 200) {
          return O.some(response.value as InitializedProfile);
        }
        if (response.status === 401) {
          return O.none
        }
        throw response
          ? Error(`response status ${response.status}`)
          : Error(I18n.t("profile.errors.load"));
      }),
    )
    yield* checkBackendProfile(backendProfile);
    return backendProfile
  } catch (e) {
    yield* put(profileLoadFailure(convertUnknownToError(e)));
  }
  return O.none
}

const toMaybeProfileLoadSuccess = O.map(checkBackendProfile);

function* checkBackendProfile(backendProfile: O.Option<InitializedProfile>) {
  if (O.isSome(backendProfile)) {
    yield* put(
      profileLoadSuccess(backendProfile.value)
    );
  } else {
    yield* put(sessionExpired());
  }
}
