import {StyleSheet} from 'react-native';
import * as themes from "../../../themes/ColorThemes";

const modalStyle = StyleSheet.create({
  modalContainer: {
    height: 400
  },
  modalTop: {
    zIndex: 100,
    width: '100%',
    flex: 1,
    backgroundColor: themes.COMPASS_MODAL,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  rightContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10
  },
  textStyle: {
    fontSize: 12,
    paddingLeft: 10
  },
  textContainer: {
    alignItems: 'center'
  }
});

export default modalStyle;
