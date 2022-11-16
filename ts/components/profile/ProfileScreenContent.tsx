import * as React from "react";
import { StyleSheet } from "react-native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List } from "native-base";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../i18n";
import NameSurnameIcon from "../../../img/assistance/nameSurname.svg";
import FiscalCodeIcon from "../../../img/assistance/fiscalCode.svg";
import EmailIcon from "../../../img/assistance/email.svg";
import { SessionToken } from "../../types/SessionToken";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { ProfileListComponent } from "./ProfileListComponent";
import { ProfileSwitchListComponent } from "./ProfileSwitchListComponent";
import { showToast } from "../../utils/showToast";
import { loadUserDataProcessing } from "../../store/actions/userDataProcessing";
import { useDispatch } from "react-redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";

type Props = {
  sessionToken: SessionToken | undefined;
  walletToken: string | undefined;
  profileEmail: O.Option<string>;
  isEmailValidated: boolean;
  hasProfileEmail: boolean;
  nameSurname: string | undefined;
  fiscalCode: string | undefined;
  userDataDeletionStatus: pot.Pot<UserDataProcessing | undefined, Error>;
  isUserDataDeletionStatusLoading: boolean;
};

const style = StyleSheet.create({
  list: {
    marginTop: 8
  }
});

export function ProfileScreenContent(props: Props) {
  const {
    nameSurname,
    profileEmail,
    fiscalCode,
    userDataDeletionStatus,
    isUserDataDeletionStatusLoading
  } = props;

  const dispatch = useDispatch();
  /*
    See if there's a better way to do that!
    
    Conversion between `pot.Pot<UserDataProcessing | undefined, Error>` 
    to `pot.Pot<boolean, Error>`, to be used by our RemoteSwitch
  */

  const deletionStatusRetrivalErrorMessage = I18n.t(
    "profile.data.list.deletionStatus.retrivalError"
  );
  const userDataDeletionSwitchStatus =
    mapUserDataDeletionStatusToRemoteSwitchStatus();

  React.useEffect(() => {
    if (pot.isError(userDataDeletionStatus)) {
      const errorMessage = I18n.t(
        "profile.data.list.deletionStatus.retrivalError"
      );
      showToast(errorMessage);
    }
    // FIX: to be removed!
    if (pot.isSome(userDataDeletionStatus)) {
      console.log(
        `🙈 rehydration userDataDeletionStatus: ${userDataDeletionStatus.value?.status}`
      );
    }
    console.log(
      `rehydration isUserDataDeletionStatusLoading: ${isUserDataDeletionStatusLoading}`
    );
    if (pot.isSome(userDataDeletionSwitchStatus)) {
      console.log(
        `rehydration userDataDeletionSwitchStatus: ${userDataDeletionSwitchStatus.value}`
      );
    }
  });

  return (
    <List style={style.list} withContentLateralPadding>
      {/* Show name and surname */}
      {nameSurname && (
        <ProfileListComponent
          Icon={NameSurnameIcon}
          title={I18n.t("profile.data.list.nameSurname")}
          subTitle={nameSurname}
          testID="name-surname"
        />
      )}
      {/* Show fiscal code */}
      {fiscalCode && (
        <ProfileListComponent
          Icon={FiscalCodeIcon}
          title={I18n.t("profile.data.list.fiscalCode")}
          subTitle={fiscalCode}
          testID="fical-code"
        />
      )}
      {/* Show email */}
      {profileEmail && (
        <ProfileListComponent
          Icon={EmailIcon}
          title={I18n.t("profile.data.list.email")}
          subTitle={pipe(
            profileEmail,
            O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
          )}
          testID="email"
        />
      )}
      {/* Show deleting user profile status switch */}
      {profileEmail && (
        <ProfileSwitchListComponent
          title={I18n.t("profile.data.list.deletionStatus.title")}
          value={userDataDeletionSwitchStatus}
          onRetry={() => {
            dispatchUserDataDeletionStatusRetry();
          }}
          testID="profileDeletionStatus"
        />
      )}
    </List>
  );

  function dispatchUserDataDeletionStatusRetry() {
    dispatch(
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
    );
  }

  function mapUserDataDeletionStatusToRemoteSwitchStatus() {
    return isUserDataDeletionStatusLoading
      ? pot.none
      : pot.isError(userDataDeletionStatus)
      ? pot.noneError(deletionStatusRetrivalErrorMessage)
      : pot.some(
          pot.isSome(userDataDeletionStatus)
            ? userDataDeletionStatus.value?.status !== undefined
            : false
        );
  }
}
