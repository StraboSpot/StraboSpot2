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
  fieldValueMultiline: {
    height: 75,
    textAlignVertical: 'top',
  },
  fieldValueFull: {
    // height: 350,
    minHeight: 200,
    maxHeight: 300,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: themes.WARNING_COLOR,
    textAlign: 'center',
  },
  halfWidthButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2.5,
    paddingBottom: 2.5,
  },
  halfWidthButtonContainer: {
    padding: 2,
    width: '50%',
  },
  fullWidthButtonContainer: {
    alignItems: 'center',
    padding: 10,
    paddingTop: 2.5,
    paddingBottom: 2.5,
  },
  formButton: {
    borderRadius: 5,
    borderColor: themes.MEDIUMGREY,
    height: 60,
    width: '100%',
  },
  formButtonSmall: {
    borderRadius: 5,
    borderColor: themes.MEDIUMGREY,
    height: 40,
    width: '100%',
  },
  formButtonLarge: {
    borderRadius: 5,
    borderColor: themes.MEDIUMGREY,
    height: 80,
    width: '100%',
  },
  formButtonTitle: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  formButtonSelectedTitle: {
    color: themes.WHITE,
    fontWeight: '400',
    fontSize: themes.SMALL_TEXT_SIZE,
  },
});
export default styles;
