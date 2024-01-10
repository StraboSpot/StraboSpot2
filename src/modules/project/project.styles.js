import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const dialogStyles = StyleSheet.create({
  buttonText: {
    fontSize: 14,
    paddingBottom: 5,
    paddingLeft: 10,
  },
  buttons: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  headerText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    paddingLeft: 10,
    textAlign: 'center',
  },
  headerTextContainer: {
    flex: 0,
    paddingBottom: 10,
    width: '100%',
  },
});

export default dialogStyles;
