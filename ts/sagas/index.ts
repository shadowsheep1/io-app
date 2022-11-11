/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga/macro";
import versionInfoSaga from "../common/versionInfo/saga/versionInfo";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { initializeProfileRequestsSaga } from "../features/profile2/saga/profile"

import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";

export default function* root() {
  yield* all([
    call(startupSaga),
    call(backendStatusSaga),
    call(versionInfoSaga),
    call(loadSystemPreferencesSaga),
    call(watchContentSaga),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga),
    call(initializeProfileRequestsSaga)
  ]);
}
