import * as React from "react";
import {
  StyleSheet,
} from "react-native";
import { View } from "native-base";
import { SvgProps } from "react-native-svg";
import { pot } from "@pagopa/ts-commons";
import { RemoteSwitch } from "../core/selection/RemoteSwitch";

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
  const iconProps = { width: 28, height: "auto" };

// TODO: manage profile icons and study flex (see if there is a standard IO Theme
export const ProfileSwitchListComponent = (props: {
  Icon?: React.FC<SvgProps>;
  title: string;
  value: pot.Pot<boolean, Error>;
  onRetry?: () => void;
  testID: string;
}) => {
  const { Icon } = props;
  
  return (
    <View style={style.listItem}>
      {Icon && (<Icon {...iconProps} style={style.iconItem} />)}
      <View style={style.textSection}>
      </View>
    </View>
  );
};