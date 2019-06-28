import {StyleSheet, Platform} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  formContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR
  },
  fieldContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 30,
    borderBottomWidth: .5,
    borderColor: themes.LIST_BORDER_COLOR
  },
  fieldContainerNotes: {
    borderBottomWidth: .5,
    borderColor: themes.LIST_BORDER_COLOR,
    paddingTop: 5
  },
  fieldLabelContainer: {
    justifyContent: 'center'
  },
  fieldLabel: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: 16
  },
  fieldValueContainer: {
    width: '100%',
    justifyContent: Platform.OS === 'ios' ? 'center' : null  // 'center' doesn't seem to work with TextInput on Android, see below for hack
  },
  fieldValue: {
    paddingLeft: 20,
    fontSize: 16,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    height: 45                      // Hack used to center text vertically
  },
  fieldValueNotes: {
    textAlignVertical: 'top',
    paddingLeft: 10,
    fontSize: 16,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    height: 90
  },
  fieldError: {
    color: 'red',
  },
  pickerStyle: {
    fontSize: 16,
    paddingLeft: 20,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    height: 45
  }
});
export default styles;
