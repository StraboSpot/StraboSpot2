import {StyleSheet} from "react-native";
import * as themes from "../../shared/styles.constants";

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
  // --- Bottom icons (line, polygon, and point) ---
  drawToolsContainer: {
    flex: 1,
    flexDirection: 'row',
    position: "absolute",
    bottom: 0,
    right: 10,
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
    bottom: 150
  },
  rightsideIcons: {
    position: "absolute",
    right: 0,
    top: 150
  },

  topCenter: {
    position: "absolute",
    top: 20,
    left: '20%'
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 0,
  },
  layersIcon: {
    marginBottom: 105
  },
  notebookViewIcon: {
    position: 'absolute',
    bottom: 150,
    right: 0
  },
  settingsIconContainer: {
    position: 'absolute',
    left: 0,
    top: 20
  },
  searchIconContainer: {
    position: 'absolute',
    right: 0,
    top: 20,
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
