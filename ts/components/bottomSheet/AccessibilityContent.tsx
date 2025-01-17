import { View } from "native-base";
import * as React from "react";
import { Modal } from "react-native";
import { IOStyles } from "../core/variables/IOStyles";

type Props = {
  header: React.ReactNode;
  content: React.ReactNode;
};
/**
 * Accessibility version of a BottomSheet including a header and it's content
 * @param header
 * @param content
 */
export const AccessibilityContent = ({ header, content }: Props) => (
  <Modal>
    <View spacer={true} extralarge={true} />
    {header}
    <View style={IOStyles.horizontalContentPadding}>{content}</View>
  </Modal>
);
