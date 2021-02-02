import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 10,
    width: 400,
  },
  dialogTitleContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  photosSavedToastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  photoSavedToastText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
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
  drawToolsContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  drawToolsButtons: {
    borderRadius: 30,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: 'yellow',
  },

  // --- Left and right icon absolute positions from top ---
  leftsideIcons: {
    position: 'absolute',
    bottom: 150,
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
    bottom: 50,
    left: '40%',
  },
  notebookButton: {
    position: 'absolute',
    top: 10,
    right: 0,
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 10,
    zIndex: -1,
  },
  homeIconContainer: {
    position: 'absolute',
    left: 0,
    top: 15,
    zIndex: -1,
  },
  currentZoomContainer: {
    zIndex: 1,
    position: 'absolute',
    top: 30,
    left: '45%',
  },
  currentZoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowRadius: 5,
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default homeStyles;
