import React from "react";
import {Text} from "react-native";
import {Divider} from "react-native-elements";
import styles from "../../shared/ui/ui.styles";

const SectionDivider = (props) => {
  return (
    <Divider style={styles.sectionDivider}>
      <Text style={styles.sectionDividerText}>{props.dividerText}</Text>
    </Divider>
  )
};

export default SectionDivider;