import * as React from "react";
import {
  StyleSheet,
} from "react-native";
import { List, View } from "native-base";
import { SvgProps } from "react-native-svg";
import ListItemComponent from "../../components/screens/ListItemComponent";

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
      {Icon && (<Icon {...iconProps} style={style.iconItem} />)}
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