import * as React from "react";
import {
  Text,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
  AccessibilityRole,
  AccessibilityState
} from "react-native";
import { View, ListItem } from "native-base";
import { SvgProps } from "react-native-svg";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RemoteSwitch } from "../core/selection/RemoteSwitch";
import customVariables from "../../theme/variables";
import { IOColors } from "../core/variables/IOColors";
import { makeFontStyleObject } from "../../theme/fonts";

const style = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: "row"
  },
  innerListItem: {
    paddingLeft: 0,
    paddingRight: 0,
    borderBottomColor: customVariables.itemSeparator
  },
  iconItem: {
    flex: 1,
    marginEnd: 16,
    marginStart: 8
  },
  textSection: {
    flex: 1,
    flexDirection: "column"
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flexRow2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  serviceName: {
    fontSize: 18,
    color: customVariables.textColorDark,
    ...makeFontStyleObject(Platform.select, "600"),
    alignSelf: "flex-start",
    paddingRight: 16
  },
  disabledItem: {
    color: IOColors.grey
  }
});
const iconProps = { width: 28, height: "auto" };

// TODO: manage profile icons and study flex (see if there is a standard IO Theme
export const ProfileSwitchListComponent = (props: {
  Icon?: React.FC<SvgProps>;
  title: string;
  value: pot.Pot<boolean, unknown>;
  onRetry?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  subTitle?: string;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  hideSeparator?: boolean;
  isItemDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
  ccessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  testID: string;
}) => {
  const { Icon } = props;

  return (
    <View style={style.listItem}>
      {Icon && <Icon {...iconProps} style={style.iconItem} />}
      <View style={style.textSection}>
        <ListItem
          style={[style.innerListItem, style.flexRow, props.style]}
          onPress={props.onPress}
          onLongPress={props.onLongPress}
          first={props.isFirstItem}
          last={props.isLastItem || props.hideSeparator}
          accessibilityLabel={props.accessibilityLabel}
          accessibilityState={props.accessibilityState}
          accessibilityRole={props.accessibilityRole}
          testID={props.testID}
        >
          <View style={style.flexColumn}>
            <View style={style.flexRow}>
              <View style={style.flexRow2}>
                <Text
                  numberOfLines={2}
                  style={[
                    style.serviceName,
                    props.isItemDisabled && style.disabledItem
                  ]}
                >
                  {props.title}
                </Text>
              </View>
              <RemoteSwitch {...props} />
            </View>
          </View>
        </ListItem>
      </View>
    </View>
  );
};
