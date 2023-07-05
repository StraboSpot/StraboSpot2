import {Dimensions, Platform, StyleSheet} from 'react-native';

import * as themes from './styles.constants';

const type = Platform.OS === 'ios' ? 'screen' : 'window';
const height = Dimensions.get(type).height;

const commonStyles = StyleSheet.create({
  alignItemsCenter: {
    alignItems: 'center',
  },
  buttonContainer: {
    paddingTop: 10,
  },
  buttonPadding: {
    padding: 10,
  },
  viewMapsButtonText: {
    fontSize: themes.SMALL_TEXT_SIZE,
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  dialogButtonText: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
    color: 'black',
  },
  dialogDisabledButtonText: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
  dialogContent: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
    position: 'absolute',
    top: '15%',
    maxHeight: height * 0.90,
  },
  dialogContentImportantText: {
    color: 'red',
    fontWeight: '500',
    textAlign: 'center',
  },
  dialogInputContainer: {
    width: 250,
    height: 40,
    backgroundColor: 'white',
  },
  dialogError: {
    backgroundColor: 'red',
  },
  dialogWarning: {
    backgroundColor: 'yellow',
  },
  dialogTitleContainer: {
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 10,
  },
  dialogText: {
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  dialogTitleSuccess: {
    backgroundColor: 'green',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogStatusMessageText: {
    fontWeight: '400',
    fontSize: themes.STATUS_MESSAGE_TEXT_SIZE,
    textAlign: 'center',
  },
  dialogConfirmText: {
    textAlign: 'center',
    paddingTop: 15,
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
});

export default commonStyles;
