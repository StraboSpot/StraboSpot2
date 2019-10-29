import {StyleSheet} from "react-native";
import * as themes from "../../shared/styles.constants";

const styles = StyleSheet.create({
  dialogBox: {
    position: 'absolute',
    bottom: 70,
    left: 100,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20
  },
  dialogTitle: {
    backgroundColor: themes.BLUE,
  },
  dialogContent: {
    borderBottomWidth: 2,
  },
  dialogText: {
    color: themes.BLUE
  }
});

export default styles;
