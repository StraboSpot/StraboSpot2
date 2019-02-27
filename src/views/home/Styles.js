import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  // --- Left and right icon absolute positions from top ---
  leftsideIcons: {
    position: 'absolute',
    left: 70
  },
  rightsideIcons: {
    position: "absolute",
    right: -5
  },

  topCenter: {
    position: "absolute",
    top: 20,
    left: 70
  },

  // --- All icons with group spacings (margins of 55) on left and right sides ---
  sideIconsGroup: {
    marginBottom: 65
  },

  // --- Bottom icons (line, polygon, and point) ---

  bottomRightIcons: {
    position: "absolute",
    bottom: 90,
    right: 45
  },
  lineIcon: {
    marginRight: 155
  },
  pointIcon: {

    marginRight: 95
  },
  polygonIcon: {

    marginRight: 35
  },

  // --- Bottom Left Icon (current location) ---
  bottomLeftIcons: {
    position: 'absolute',
    bottom: 30,
    left: 70
  },
  layersIcon: {
    marginBottom: 105
  },

  // --- Icons with specialized margins ---
  mapActionsIcon: {
    marginTop: 415
  },
  notebookViewIcon: {
    marginTop: 105
  },
  searchAndSettingsIcons: {
    marginTop: 20
  },
  tagIcon: {
    marginTop: 145
  },

  dialog: {
    position: 'absolute',
    bottom: 10
  }
});

export default styles;
