import {StyleSheet} from 'react-native';
import * as themes from "../../styles.constants";

const modalStyle = StyleSheet.create({
  modalContainer: {
    // height: 600,
    width: 275,
    opacity: .90
  },
  // modalBottom: {
  //   flex: 8,
  //   paddingBottom: 20,
  //   backgroundColor: themes.MODAL,
  //   borderBottomRightRadius: 20,
  //   borderBottomLeftRadius: 20
  // },
  modalTop: {
    zIndex: 100,
    // width: '100%',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: themes.MODAL,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
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
