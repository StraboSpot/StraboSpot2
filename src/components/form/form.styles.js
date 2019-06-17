import {StyleSheet, Platform} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  formContainer: {
    paddingLeft: 10,
    paddingRight: 10
  },
  fieldContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderBottomWidth: .5,
    borderColor: themes.MEDIUMGREY
  },
  fieldContainerNotes: {
    borderBottomWidth: .5,
    borderColor: themes.MEDIUMGREY,
    paddingTop: 5
  },
  fieldLabelContainer: {
    justifyContent: 'center'
  },
  fieldLabel: {
    color: 'black',
    fontSize: 25
  },
  fieldValueContainer: {
    width: '100%',
    justifyContent: Platform.OS === 'ios' ? 'center' : null  // 'center' doesn't seem to work with TextInput on Android, see below for hack
  },
  fieldValue: {
    paddingLeft: 20,
    fontSize: 25,
    color: themes.MEDIUMGREY,
    height: 45                      // Hack used to center text vertically
  },
  fieldValueNotes: {
    textAlignVertical: 'top',
    paddingLeft: 10,
    fontSize: 25,
    color: themes.MEDIUMGREY,
    height: 90
  },
  fieldError: {
    color: 'red',
  },
  pickerStyle: {
    fontSize: 25,
    paddingLeft: 20,
    color: themes.MEDIUMGREY,
    height: 45
  }
});
export default styles;
