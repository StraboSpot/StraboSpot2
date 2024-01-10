import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const platform = Platform.OS;

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    paddingLeft: 50,
    paddingRight: 50,
  },
  buttonContainer: {
    marginTop: 10,
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  dialogTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 30,
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  itemSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  itemSubTextStyle: {
    fontSize: 14,
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  modalButtonText: {
    paddingLeft: 10,
    paddingRight: 15,
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
