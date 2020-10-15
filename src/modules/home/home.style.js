import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  buttonWithBackground: {
    color: 'black',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
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
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: themes.BLUE,
  },
  dialogFooter: {
    flexDirection: 'column',
    // margin: 5,
    height: 120,
  },
  photosSavedToastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  photoSavedToastText: {
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
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
  drawerStyles: {
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderTopRightRadius: 0.30,
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
    bottom: 90,
    right: '45%',
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
  currentZoom: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    position: 'absolute',
    top: 15,
    right: '45%',
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default homeStyles;
