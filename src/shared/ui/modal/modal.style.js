import {StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

const modalStyle = StyleSheet.create({
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
    borderRadius: themes.MODAL_BORDER_RADIUS
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
