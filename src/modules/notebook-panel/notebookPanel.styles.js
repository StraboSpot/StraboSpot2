import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';
import {SMALL_SCREEN} from '../../shared/styles.constants';

const notebookStyles = StyleSheet.create({
  notebookDrawer: {
    height: '100%',
    position: 'absolute',
    right: 0,
    width: 400,
    zIndex: -1,
  },
  notebookPanel: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    flex: 1,
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
  dialogContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderColor: themes.MEDIUMGREY,
    borderRadius: themes.MODAL_BORDER_RADIUS,
    borderWidth: 0.5,
    elevation: 2,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 300,
    position: SMALL_SCREEN ? 'null' : 'absolute',
    top: SMALL_SCREEN ? 0 : 20,
    right: SMALL_SCREEN ? 0 : 20,
  },
  dialogBoxPosition: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dialogTitle: {
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
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
