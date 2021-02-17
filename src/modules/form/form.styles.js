import {StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  dropdownContainer: {
    marginTop: -5,
    marginBottom: -5,
  },
  dropdownSelectedContainer: {
    paddingTop: 0, //Overrides default
    paddingBottom: 0, //Overrides default
    paddingRight: 15,
    marginRight: -20,
    borderBottomWidth: 0,
  },
  dropdownSelectionListHeader: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    padding: 0,
    marginLeft: -15,
    marginRight: -20,
  },
  selectorContainer: {
    marginRight: -20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
  },
  fieldLabel: {
    flex: 1,
    alignSelf: 'center',
    paddingTop: 2.5,
    paddingBottom: 2.5,
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
  },
  fieldValue: {
    width: '100%',
    padding: 0,
    paddingLeft: 5,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  filterFieldValue: {
    width: '100%',
    padding: 5,
    paddingLeft: 10,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
    backgroundColor: themes.WHITE,
    borderBottomWidth: 1,
    borderColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  fieldError: {
    color: themes.WARNING_COLOR,
    textAlign: 'center',
  },
});
export default styles;
