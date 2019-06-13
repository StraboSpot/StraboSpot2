import {StyleSheet} from 'react-native';
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
  fieldLabelContainer: {
    justifyContent: 'center'
  },
  fieldLabel: {
    color: 'black',
    fontSize: 25
  },
  fieldValueContainer: {
    width: '100%',
   justifyContent: 'center'      // Doesn't seem to work with TextInput, see below for hack
  },
  fieldValue: {
    paddingLeft: 20,
    fontSize: 25,
    color: themes.MEDIUMGREY,
    height: 45                      // Hack used to center text vertically
  },
  fieldError: {
    color: 'red',
  },
  pickerStyle: {
    fontSize: 25,
    paddingHorizontal: 10,
    color: themes.MEDIUMGREY,
    paddingRight: 30, // to ensure the text is never behind the icon
  }
});
export default styles;
