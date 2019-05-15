import {StyleSheet} from 'react-native';
import * as themes from '../../../themes/ColorThemes';

const notebookFooterStyles = StyleSheet.create({
  footerContainer: {
    height: 70,
    borderTopWidth: 2,
    padding: 10,
    flexDirection: 'row',
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
