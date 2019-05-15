import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  buttonWithBackground: {
    color: 'black',
    fontSize: 16,
    // paddingTop: 5,
    // paddingBottom: 5,
    marginTop: 5,
    marginBottom: 5
  },
  // --- Drawer Styles ---
  drawToolsContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  drawerStyles: {
    shadowColor: '#000000',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderTopRightRadius: .30
  },

  // --- Left and right icon absolute positions from top ---
  leftsideIcons: {
    position: 'absolute',
    left: 10,
    bottom: 150
  },
  rightsideIcons: {
    position: "absolute",
    right: 10,
    top: 150
  },

  topCenter: {
    position: "absolute",
    top: 20,
    left: '40%'
  },

  // --- All icons with group spacings (margins of 55) on left and right sides ---
  sideIconsGroup: {
    // marginBottom: 65,
    // marginLeft: 10
  },
  sideIconsGroupContainer: {

    // marginTop: 100
  },

  // --- Bottom icons (line, polygon, and point) ---

  bottomRightIcons: {
    position: "absolute",
    bottom: 10,
    right: 10
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 10,
    left: 10
  },
  layersIcon: {
    marginBottom: 105
  },

  // --- Icons with specialized margins ---
  mapActionsIcon: {
    // marginTop: 415
  },
  notebookViewIcon: {
    position: 'absolute',
    bottom: 150,
    right: 10
    // marginTop: 50
  },
  settingsIconContainer: {
    position: 'absolute',
    right: 10,
    top: 20
    // marginTop: 20,
    // marginLeft: 10
  },
  searchIconContainer: {
    position: 'absolute',
    left: 10,
    top: 20
  },
  tagIcon: {
    marginTop: 145
  },

  dialog: {
    position: 'absolute',
    bottom: 10
  },

  // --- Modal Style ---
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default styles;
