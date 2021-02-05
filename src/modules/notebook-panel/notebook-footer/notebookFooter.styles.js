import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const notebookFooterStyles = StyleSheet.create({
  footerIconContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  footerIconContainerWrap: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  morePagesButton: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
  morePagesDialog: {
    position: 'absolute',
    width: 250,
    // height: '95%',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  morePagesListItem: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 0,
    paddingRight: 0,
  },
  morePagesSectionDivider: {
    borderBottomWidth: 1,
  },
});

export default notebookFooterStyles;
