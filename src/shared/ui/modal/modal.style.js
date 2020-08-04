import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

// eslint-disable-next-line no-unused-vars
const {width, height} = Dimensions.get('window');

const modalStyle = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
  },
  modalContainer: {
    width: 250,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1,
  },
  modalBottom: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalTop: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  textStyle: {
    fontSize: themes.MODAL_TEXT_SIZE,
    color: themes.MODAL_PRIMARY_TEXT_INFORM_COLOR,
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
});

export default modalStyle;
