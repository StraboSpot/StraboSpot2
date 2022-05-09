import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },
  button: {
    borderRadius: 30,
    paddingRight: 50,
    paddingLeft: 50,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  dialogTitleContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogTitle: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 30,
    paddingBottom: 10,
  },
  modalButtonText: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSubContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  itemSubTextStyle: {
    fontSize: 14,
  },
  pickerIOS: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerAndroid: {
    flex: 1,
    width: '50%',
  },
  saveModalContainer: {
    flex: 1,
    width: 300,
  },

});

export default styles;
