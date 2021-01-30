import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const dialogStyles = StyleSheet.create({
  buttons: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  buttonText: {
    fontSize: 14,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
  },
  dialogContent: {
    marginTop: 15,
    paddingBottom: 10,
  },
  dialogConfirmText: {
    textAlign: 'center',
    paddingTop: 15,
  },
  dialogTitleContainer: {
    alignContent: 'center',
    backgroundColor: 'red',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: 'black',
  },
  dialogDisabledButtonText: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
  headerTextContainer: {
    flex: 0,
    paddingBottom: 10,
    width: '100%',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    paddingLeft: 10,
  },
});

export default dialogStyles;
