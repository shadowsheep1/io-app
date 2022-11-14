import { connect } from "react-redux";
import * as React from "react";
import I18n from "../../i18n";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { ProfileScreenContent } from "../../components/profile/ProfileScreenContent"
import { TranslationKeys } from "../../../locales/locales";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import ScreenContent from '../../components/screens/ScreenContent';
import {
  hasProfileEmailSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileNameSurnameSelector,
  profileFiscalCodeSelector
} from "../../store/reducers/profile";

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
  fiscalCode: profileFiscalCodeSelector(state)
});

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent2"
};

const ProfileMainScreen2 = (props: Props) => {
  const title = I18n.t("profile.main.title");
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={title}
      accessibilityLabel={title}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <ScreenContent title={title} >
        <ProfileScreenContent {...props} />
      </ScreenContent>
    </BaseScreenComponent>
  );
};

export default connect(
  mapStateToProps
)(withLightModalContext(ProfileMainScreen2));