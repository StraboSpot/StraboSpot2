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
