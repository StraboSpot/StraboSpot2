import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  formContainer: {
    // paddingLeft: 10,
    // paddingRight: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  fieldLabel: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  fieldValue: {
    paddingLeft: 10,
    paddingTop: 0,
    // paddingBottom: 5,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  notesFieldContainer: {
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
    paddingTop: 5,
  },
  notesFieldLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesFieldValueContainer: {
    height: 90,
    paddingLeft: 10,
  },
  notesFieldValue: {
    textAlignVertical: 'top',
    paddingLeft: 0,
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  dateFieldValueContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    alignContent: 'flex-start',
  },
  selectFieldValue: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 0,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  fieldError: {
    color: 'red',
    textAlign: 'center',
  },
});
export default styles;
