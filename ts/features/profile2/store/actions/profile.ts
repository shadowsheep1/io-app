import { ActionType, createStandardAction } from "typesafe-actions";

export const initializeProfileRequest =
  createStandardAction("INITIALIZE_PROFILE")();

export type Profile2Actions = ActionType<typeof initializeProfileRequest>;
