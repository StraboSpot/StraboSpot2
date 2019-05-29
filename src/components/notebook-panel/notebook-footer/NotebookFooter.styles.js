import {StyleSheet} from 'react-native';
import * as themes from '../../../themes/ColorThemes';

const notebookFooterStyles = StyleSheet.create({
  footerContainer: {
    flex:5,
    // height: 70,
    borderTopWidth: 1,
    padding: 10,
    backgroundColor: themes.LIGHTGREY,
    borderBottomLeftRadius: 30

  },
  footerIconContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  footerIcon: {
    width: 40,
    height: 40
  }
});

export default notebookFooterStyles;
