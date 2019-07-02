import {StyleSheet, Platform} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  formContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR
  },
  fieldLabel: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE
  },
  fieldValue: {
    paddingLeft: 10,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  notesFieldContainer: {
    borderBottomWidth: .5,
    borderColor: themes.LIST_BORDER_COLOR,
    paddingTop: 5
  },
  notesFieldLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  notesFieldValueContainer: {
    justifyContent: 'center',
    height: 90
  },
  fieldValueNotes: {
    textAlignVertical: 'top',
    paddingLeft: 10,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR
  },
  fieldError: {
    color: 'red',
  },
  pickerStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingLeft: 10,
    color: themes.SECONDARY_ITEM_TEXT_COLOR
  }
});
export default styles;
