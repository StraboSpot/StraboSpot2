import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const platform = Platform.OS;

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
  pickerAndroid: {
    // flex: 1,
    // width: '50%',
  },
  saveModalContainer: {
    minHeight: platform === 'ios' ? 300 : 275,
  },

});

export default styles;
