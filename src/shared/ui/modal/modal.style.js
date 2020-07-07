import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

// eslint-disable-next-line no-unused-vars
const {width, height} = Dimensions.get('window');

const modalStyle = StyleSheet.create({
  modalContainer: {
    width: 250,
    // height: 500,
    opacity: 0.90,
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
    zIndex: 1,
  },
  modalBottom: {
    paddingBottom: 20,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  modalTop: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  textStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingLeft: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
});

export default modalStyle;
