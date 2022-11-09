import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { List } from "native-base";
import ListItemComponent from "../../components/screens/ListItemComponent";
import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../i18n";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
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
  body: "profile.main.contextualHelpContent"
};

const ProfileMainScreen2 = (props: Props) => {
  var title = I18n.t("profile.main.title")
  var { nameSurname, profileEmail, fiscalCode } = props
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={title}
      accessibilityLabel={title}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile"]}
    >
        <ScreenContent
          title={I18n.t("profile.main.title")}
        >
        <List withContentLateralPadding>
          {/* Show name and surname */}
          {nameSurname && (
            <ListItemComponent
              iconName="foo"
              title={I18n.t("profile.data.list.nameSurname")}
              subTitle={nameSurname}
              hideIcon
              testID="name-surname"
            />
          )}
          {/* Show fiscal code */}
          <ListItemComponent
            title={I18n.t("profile.data.list.fiscalCode")}
            subTitle={fiscalCode}
            hideIcon
            testID="email"
          />
          {/* Show email */}
          <ListItemComponent
            title={I18n.t("profile.data.list.email")}
            subTitle={pipe(
              profileEmail,
              O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
            )}
            hideIcon
            testID="email"
          />
          </List>
        </ScreenContent>
    </BaseScreenComponent>
  );
};

export default connect(
  mapStateToProps
)(withLightModalContext(ProfileMainScreen2));