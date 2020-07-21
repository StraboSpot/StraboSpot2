import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const notebookFooterStyles = StyleSheet.create({
  footerIconContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
});

export default notebookFooterStyles;
