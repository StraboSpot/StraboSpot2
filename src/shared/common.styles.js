import {Platform, StyleSheet} from 'react-native';

import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  alignItemsCenter: {
    alignItems: 'center',
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: themes.TEXT_WEIGHT,
  },
  buttonContainer: {
    paddingTop: 10,
  },
  buttonPadding: {
    padding: 10,
  },
  checkboxContainer: {
    borderWidth: 0,
    backgroundColor: 'white',
  },
  viewMapsButtonText: {
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  iconColor: {
    color: themes.BLUE,
  },
  noValueText: {
    padding: 10,
    textAlign: 'center',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  // List Styles
  listItem: {
    padding: Platform.OS === 'web' ? 5 : 10,
  },
  listItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  listItemInverse: {
    padding: 10,
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
  },
  listItemFormField: {
    padding: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  listItemTitle: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  listItemTitleInverse: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  listItemSubtitle: {
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.DARKGREY,
    marginTop: 5,
  },
  standardButtonContainer: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  standardButton: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 50,
    borderRadius: 10,
  },
  standardButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  standardButtonTextInverse: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  standardDescriptionText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  textInput: {
    backgroundColor: 'white',
    width: 200,
    paddingLeft: 20,
  },
  imagePlaceholder: {
    backgroundColor: themes.MEDIUMGREY,
  },
});

export default commonStyles;
