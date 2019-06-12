import {StyleSheet} from 'react-native';
import * as themes from "../../../themes/ColorThemes";

const modalStyle = StyleSheet.create({
  modalContainer: {
    height: 400,
  },
  modalBottom: {
    backgroundColor: themes.COMPASS_MODAL,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  modalTop: {
    zIndex: 100,
    width: '100%',
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: themes.COMPASS_MODAL,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
  textStyle: {
    fontSize: 12,
    paddingLeft: 10
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: themes.COMPASS_MODAL,
  }
});

export default modalStyle;
