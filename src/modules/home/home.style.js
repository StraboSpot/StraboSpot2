import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const homeStyles = StyleSheet.create({
  buttonContainer: {
    alignContent: 'center',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  connectionStatusIconContainer: {
    paddingEnd: 5,
  },
  statusBarContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: -1,
    justifyContent: 'center',
  },
  iconButton: {
    top: 5,
  },
  imageSliderContainer: {
    flex: 1,
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
  },
  mapboxAttributionPosition: {
    right: 10,
    bottom: Platform.OS === 'ios' ? -15 : 7,
  },
  mapboxLogoPosition: {
    left: 10,
    bottom: Platform.OS === 'ios' ? -15 : 7,
  },
  buttonTextAlign: {
    textAlign: 'center',
  },
  toastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  toastText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  offlineMapLabelContainer: {
    position: 'absolute',
    top: 60,
    right: '45%',
  },
  offlineMapViewLabel: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'yellow',
    textShadowColor: 'black',
    textShadowRadius: 10,
  },

  // --- Drawer Styles ---
  // --- Bottom icons (line, polygon, and point) ---
  drawContainer: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    zIndex: -1,
  },
  drawToolsContainer: {
    flexDirection: 'row',
  },

  drawToolsButtons: {
    borderRadius: 30,
    borderWidth: 1,
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: themes.BLUE,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  drawToolsTitle: {
    color: 'white',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  editButtonsContainer: {
    width: 185,
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: themes.LIGHTGREY,
    padding: 10,
    borderRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDatasetContainer: {
    backgroundColor: themes.LIGHTGREY,
    borderRadius: 10,
    padding: 15,
    width: 160,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  //Small Screen Icon Box
  actionButtonsSmallScreenContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    alignItems: 'center',
  },
  smallScreenMapActionButtons: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  smallScreenDrawActionButtons: {
    flexDirection: 'row',
    paddingLeft: 10,
  },

  // --- Left and right icon absolute positions from top ---
  mapActionsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 10,
    zIndex: -1,
  },
  shortcutButtons: {
    position: 'absolute',
    right: 0,
    top: 150,
    zIndex: -1,
  },
  drawSaveAndCancelButtons: {
    position: 'absolute',
    bottom: 100,
    right: '40%',
  },
  notebookButton: {
    position: 'absolute',
    top: 10,
    right: 0,
  },
  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    zIndex: -1,
  },
  homeIconContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: -1,
  },
  currentZoomTextBlack: {
    color: themes.BLACK,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: themes.LIGHTGREY,
    textShadowRadius: 10,
    marginLeft: 40,
  },
  currentZoomTextWhite: {
    color: themes.LIGHTGREY,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: themes.BLACK,
    textShadowRadius: 10,
    marginLeft: 40,
  },
  addIntervalButton: {
    position: 'absolute',
    top: 10,
    right: 60,
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlText: {
    fontSize: themes.SMALL_TEXT_SIZE,
  },

  zoomAndScaleBarContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: 60,
    left: 40,
  },
  webScaleControl: {
    position: 'absolute',
    left: 50,
    bottom: 20,
    background: 'red',
    fontWeight: 'bold',
  },
});

export default homeStyles;
