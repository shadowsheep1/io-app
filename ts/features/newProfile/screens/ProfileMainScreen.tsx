import { connect, useDispatch } from "react-redux";
import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../i18n";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { TranslationKeys } from "../../../../locales/locales";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../../store/reducers/authentication";
import { GlobalState } from "../../../store/reducers/types";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import ScreenContent from "../../../components/screens/ScreenContent";
import { Dispatch } from "../../../store/actions/types";
import {
  hasProfileEmailSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileNameSurnameSelector,
  profileFiscalCodeSelector
} from "../../../store/reducers/profile";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import { loadUserDataProcessing } from "../../../store/actions/userDataProcessing";
import { userDataProcessingSelector } from "../../../store/reducers/userDataProcessing";
import { refreshUserProfileDataRequest } from "../store/actions/profile";
import { ProfileScreenContent } from "../../../components/profile/ProfileScreenContent";

type Props = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GlobalState) => ({
  sessionToken: isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined,
  walletToken: isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined,
  profileEmail: profileEmailSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  hasProfileEmail: hasProfileEmailSelector(state),
  nameSurname: profileNameSurnameSelector(state),
  fiscalCode: profileFiscalCodeSelector(state),
  loadUserDataProcessingAction: loadUserDataProcessing,
  userDataDeletionStatus: userDataProcessingSelector(state).DELETE,
  isUserDataDeletionStatusLoading:
    pot.isNone(userDataProcessingSelector(state).DELETE) &&
    pot.isLoading(userDataProcessingSelector(state).DELETE)
});

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualNewHelpContent"
};

const ProfileMainScreen = (props: Props) => {
  const title = I18n.t("profile.main.title");
  const dispatch = useDispatch();

  React.useEffect(() => {
    /**
     * Refresh the user profile data from backend server.
     * This is done under the hood.
     */
    dispatch(refreshUserProfileDataRequest());
    /**
     * Check the user profile deletion status from server.
     * Backend service return 404 (for unset value) or 200 (for a set value).
     * => This comment is only for my onboarding purpose.
     */
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }, []);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={title}
      accessibilityLabel={title}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <ScreenContent title={title}>
        <ProfileScreenContent {...props} />
      </ScreenContent>
    </BaseScreenComponent>
  );
};

export default connect(mapStateToProps)(
  withLightModalContext(ProfileMainScreen)
);
