import {StyleSheet} from 'react-native';
import * as themes from "../../../themes/ColorThemes";

const modalStyle = StyleSheet.create({
  modalContainer: {
    height: 550,
  },
  modalBottom: {
    backgroundColor: themes.COMPASS_MODAL,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  modalTop: {
    zIndex: 100,
    // width: '100%',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop:0,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: themes.COMPASS_MODAL,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
  textStyle: {
    fontSize: 18,
    paddingLeft: 10
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: themes.COMPASS_MODAL,
  }
});

export default modalStyle;
