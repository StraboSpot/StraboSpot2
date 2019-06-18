import {StyleSheet} from 'react-native';
import * as themes from './ColorThemes';

const commonStyles = StyleSheet.create({
  listItem: {
    padding: 10,
    borderBottomWidth: .5,
    borderColor: themes.MEDIUMGREY,
  },
  listItemTitle: {
    color: 'black',
    fontSize: 20,
  },


});

export default commonStyles;
