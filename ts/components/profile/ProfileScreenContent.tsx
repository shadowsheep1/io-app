import * as React from "react";
import {
  StyleSheet,
} from "react-native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List } from "native-base";
import I18n from "../../i18n";
import NameSurnameIcon from "../../../img/assistance/nameSurname.svg";
import FiscalCodeIcon from "../../../img/assistance/fiscalCode.svg";
import EmailIcon from "../../../img/assistance/email.svg";
import { SessionToken } from "../../types/SessionToken";
import { ProfileListComponent } from "./ProfileListComponent";

type Props = {
  sessionToken: SessionToken | undefined;
  walletToken: string | undefined;
  profileEmail: O.Option<string>;
  isEmailValidated: boolean;  
  hasProfileEmail: boolean;
  nameSurname: string | undefined;
  fiscalCode: string | undefined;
};

const style = StyleSheet.create({
    list: {
      marginTop: 8
    }
  });
  
export function ProfileScreenContent(props: Props) {
  const { nameSurname, profileEmail, fiscalCode } = props;
  
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
    {fiscalCode && (<ProfileListComponent
      Icon={FiscalCodeIcon}
      title={I18n.t("profile.data.list.fiscalCode")}
      subTitle={fiscalCode}
      testID="fical-code" />
    )}
    {/* Show email */}
    {profileEmail && (<ProfileListComponent
      Icon={EmailIcon}
      title={I18n.t("profile.data.list.email")}
      subTitle={pipe(
        profileEmail,
        O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
      )}
      testID="email" />
    )}
  </List>;
}