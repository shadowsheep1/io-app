import { connect } from "react-redux";
import * as React from "react";
import {
  StyleSheet,
} from "react-native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List, View } from "native-base";
import { SvgProps } from "react-native-svg";
import ListItemComponent from "../../components/screens/ListItemComponent";
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
import NameSurnameIcon from "../../../img/assistance/nameSurname.svg";
import FiscalCodeIcon from "../../../img/assistance/fiscalCode.svg";
import EmailIcon from "../../../img/assistance/email.svg";

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
  const title = I18n.t("profile.main.title");
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={title}
      accessibilityLabel={title}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile"]}
    >
      <ScreenContent title={I18n.t("profile.main.title")} >
        {screenContent(props)}
      </ScreenContent>
    </BaseScreenComponent>
  );
};

function screenContent(props: Props) {
  const { nameSurname, profileEmail, fiscalCode } = props;
  const style = StyleSheet.create({
    list: {
      marginTop: 8
    }
  });
  return <List
    style={style.list}
    withContentLateralPadding>
    {/* Show name and surname */}
    {nameSurname && (
      <ProfileListComponent
        Icon={NameSurnameIcon}
        title={I18n.t("profile.data.list.nameSurname")}
        subTitle={nameSurname}
        testID="name-surname" />
    )}
    {/* Show fiscal code */}
    <ProfileListComponent
      Icon={FiscalCodeIcon}
      title={I18n.t("profile.data.list.fiscalCode")}
      subTitle={fiscalCode}
      testID="fical-code" />
    {/* Show email */}
    <ProfileListComponent
      Icon={EmailIcon}
      title={I18n.t("profile.data.list.email")}
      subTitle={pipe(
        profileEmail,
        O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
      )}
      testID="email" />
  </List>;
}

// TODO: manage profile icons and study flex (see if there is a standard IO Theme
export const ProfileListComponent = (props: {
  Icon?: React.FC<SvgProps>;
  title: string;
  subTitle: string | undefined;
  testID: string;
}) => {
  const { Icon, title, subTitle, testID } = props;
  const iconProps = { width: 28, height: "auto" };
  const style = StyleSheet.create({
    listItem: {
      flex: 1,
      flexDirection: "row",
    },
    iconItem: {
      flex: 1,
      marginEnd: 16,
      marginStart: 8,
    },
    textSection: {
      flex: 1,
      flexDirection: "column",
    }
  });
  return (
    <View style={style.listItem}>
      {Icon && <Icon {...iconProps} style={style.iconItem} />}      
      <View style={style.textSection}>
        <ListItemComponent
          title={title}
          subTitle={subTitle}
          hideIcon
          testID={testID} />
      </View>
    </View>
  );
};

export default connect(
  mapStateToProps
)(withLightModalContext(ProfileMainScreen2));