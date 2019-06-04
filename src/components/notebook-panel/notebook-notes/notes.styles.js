import {StyleSheet} from 'react-native'
import * as themes from '../../../themes/ColorThemes';

const noteStyles = StyleSheet.create({
  noteInputBox: {
    margin: 10,
    backgroundColor: 'white'
  },
  timestampText: {
    color: themes.MEDIUMGREY
  }
});

export default noteStyles;
