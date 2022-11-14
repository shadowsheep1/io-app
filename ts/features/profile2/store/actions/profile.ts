import { ActionType, createStandardAction } from "typesafe-actions";

export const refreshUserProfileDataRequest =
  createStandardAction("REFRESH_USER_PROFILE_DATA_REQUEST")();

export type  RefreshUserProfileDataAction = ActionType<typeof refreshUserProfileDataRequest>;
