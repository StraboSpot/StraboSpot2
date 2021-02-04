import {StyleSheet} from 'react-native';

import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  appContainer: {
    backgroundColor: themes.BLACK,
    flex: 1,
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
  dialogContent: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
    position: 'absolute',
    top: '15%',
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
  dialogWarning: {
    backgroundColor: 'red',
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
  listItemTitle: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  listItemTitleInverse: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
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
  standardDescriptionText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
});

export default commonStyles;
