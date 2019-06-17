import {StyleSheet} from "react-native";
import * as themes from "../../themes/ColorThemes";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  buttonWithBackground: {
    color: 'black',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5
  },
  // --- Drawer Styles ---
  drawToolsContainer: {
    // flex: 3,
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
  notebookViewIcon: {
    position: 'absolute',
    bottom: 150,
    right: 10
  },
  settingsIconContainer: {
    position: 'absolute',
    right: 10,
    top: 20
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
  },
  compassModalContainer: {
    // flex: 1,
    // position: 'absolute',
    // bottom: 75,
    // left: 150,
    // width: 400,
    // height: 400,
    // backgroundColor: 'transparent',
    flex: 1,
    width: 275,
    height: 300,
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: themes.LIGHTGREY,
    position: 'absolute', //Here is the trick
    left: 80,
    // bottom: 150,
    top: 250,
    // zIndex: 100,
  },
});

export default styles;
