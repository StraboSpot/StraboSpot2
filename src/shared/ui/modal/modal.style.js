import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';
import {SMALL_SCREEN} from '../../styles.constants';

const modalStyle = StyleSheet.create({
  modalContainer: {
    width: 300,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 1,
    padding: 0,
  },
  modalContainerFullScreen: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    overflow: 'hidden',
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' && SMALL_SCREEN ? 30 : 0,
  },
  modalHeaderContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    paddingTop: 5,
  },
  modalHeaderButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 60,
    borderRadius: 20,
  },
  sideModalPosition: {
    position: 'absolute',
    left: 100,
    bottom: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: themes.PRIMARY_TEXT_COLOR,
  },
  modalTop: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  textStyle: {
    fontSize: themes.MODAL_TEXT_SIZE,
    color: themes.WARNING_COLOR,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
});

export default modalStyle;
