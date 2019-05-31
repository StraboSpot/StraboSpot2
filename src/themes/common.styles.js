import {StyleSheet} from 'react-native';
import * as themes from './ColorThemes';

const commonStyles = StyleSheet.create({
  sectionDivider: {
    height: 30,
    paddingLeft: 10,
    justifyContent: 'center',
    backgroundColor: themes.LIGHTGREY
  },
  sectionDividerText: {
    fontSize: 16,
    lineHeight: 30,
    textTransform: 'uppercase',
    color: themes.DARKGREY
  },
  listItem: {
    height: 40,
    borderBottomWidth: .5,
    borderColor: themes.MEDIUMGREY,
  },
  listItemTitle: {
    color: 'black',
    fontSize: 20,
  }
});

export default commonStyles;