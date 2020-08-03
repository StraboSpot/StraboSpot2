import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

// eslint-disable-next-line no-unused-vars
const {width, height} = Dimensions.get('window');

const modalStyle = StyleSheet.create({
  modalContainer: {
    width: 250,
    // height: 500,
    // opacity: 0.90,
    backgroundColor: '#f7f7f7',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1,
  },
  modalBottom: {
    paddingBottom: 20,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalTop: {
    // flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // paddingLeft: 10,
    // paddingRight: 10,
    // backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // borderTopRightRadius: 20,
    // borderTopLeftRadius: 20,
  },
  textStyle: {
    fontSize: themes.MODAL_TEXT_SIZE,
    color: themes.MODAL_PRIMARY_TEXT_INFORM_COLOR,
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
});

export default modalStyle;
