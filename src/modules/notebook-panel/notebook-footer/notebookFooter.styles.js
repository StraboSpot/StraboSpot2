import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const notebookFooterStyles = StyleSheet.create({
  footerIconContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  footerIconContainerWrap: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  morePagesButton: {
    color: themes.PRIMARY_HEADER_TEXT_COLOR,
  },
  morePagesDialog: {
    position: 'absolute',
    width: 250,
    height: '95%',
    bottom: 10,
    right: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
    zIndex: 10,
  },
  morePagesListItem: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 0,
    paddingRight: 0,
  },
  morePagesSectionDivider: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderBottomWidth: 1,
  },
});

export default notebookFooterStyles;
