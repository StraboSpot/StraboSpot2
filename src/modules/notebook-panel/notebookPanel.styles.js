import {Dimensions, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const notebookStyles = StyleSheet.create({
  panel: {
    width: Math.min(400, Dimensions.get('window').width),
    height: '100%',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    position: 'absolute',
    right: 0,
    zIndex: -1,
  },
   headerContainer: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: themes.DARKGREY,
    paddingBottom: 5,
    paddingTop: 5,
  },
  centerContainer: {
    flex: 10,
  },
  footerContainer: {
    borderTopWidth: 2,
    borderTopColor: themes.DARKGREY,
  },
  noSpotContentHeaderText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    paddingBottom: 10,
  },
  noSpotContentText: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  collapsibleSectionHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 30,
  },
  collapsibleSectionHeaderText: {
    fontSize: 14,
    lineHeight: 30,
    textTransform: 'uppercase',
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
  },
  dialogBox: {
    position: 'absolute',
    width: 200,
    top: 10,
    right: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
    zIndex: 10,
  },
  dialogTitle: {
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
  },
  dialogTitleText: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogContent: {
    borderTopWidth: 1,
    borderColor: 'lightgrey',
  },
  dialogText: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  traceSurfaceFeatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: themes.DARKGREY,
  },
  traceSurfaceFeatureToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  traceSurfaceFeatureToggleText: {
    paddingRight: 10,
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  traceSurfaceFeatureDisabledText: {
    color: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sectionContainer: {
    borderBottomWidth: 2,
    borderBottomColor: themes.DARKGREY,
  },
});

export default notebookStyles;
