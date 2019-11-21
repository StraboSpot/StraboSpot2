import {StyleSheet} from 'react-native';
import * as themes from '../shared/styles.constants';

const dialogStyles = StyleSheet.create({
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
  },
  dialogTitle: {
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
  signInText: {
    paddingBottom: 20,
    textAlign: 'center',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  signInContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
});

export default dialogStyles;
