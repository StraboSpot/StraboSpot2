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
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: themes.MEDIUMGREY,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  footerContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderTopWidth: 0.5,
    borderTopColor: themes.MEDIUMGREY,
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
    borderBottomWidth: 0.5,
    borderBottomColor: themes.MEDIUMGREY,
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
});

export default notebookStyles;
