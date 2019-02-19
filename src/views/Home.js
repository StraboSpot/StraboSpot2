import React from 'react'
import {
  View,
  StyleSheet
} from 'react-native'
import {goToAuth, goSignIn} from '../routes/Navigation'
import MapView, {getCurrentLocation} from '../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import IconButton from '../ui/IconButton';
import MapActionsDialog from '../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../components/modals/base-maps/BaseMapDialogBox";
// import {Navigation} from "react-native-navigation";
import SettingsSideMenu from '../views/SettingsSideMenu';
import {Drawer} from "native-base";

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.mapViewElement = React.createRef();
    this.state = {
      dialogs: {
        mapActionsMenuVisible: false,
        mapSymbolsMenuVisible: false,
        baseMapMenuVisible: false
      },
    };
  }

  componentDidMount() {
    Icon.getImageSource("pin", 30)
  }

  clickHandler = (name) => {
    switch (name) {
      case "search":
        console.log(`${name}`, " was clicked");
        break;
      case "tag":
        console.log(`${name}`, " was clicked");
        break;
      case "measurement":
        console.log(`${name}`, " was clicked");
        break;
      case "sample":
        console.log(`${name}`, " was clicked");
        break;
      case "note":
        console.log(`${name}`, " was clicked");
        break;
      case "photo":
        console.log(`${name}`, " was clicked");
        break;
      case "sketch":
        console.log(`${name}`, " was clicked");
        break;
      case "notebook":
        console.log(`${name}`, " was clicked");
        break;
      case "point":
        console.log(`${name}`, " was clicked");
        break;
      case "line":
        console.log(`${name}`, " was clicked");
        break;
      case "polygon":
        console.log(`${name}`, " was clicked");
        break;
      case "settings":
        console.log(`${name}`, " was clicked");
        goSignIn();
        break;
      case "mapActions":
        console.log(`${name}`, " was clicked");
        break;
      case "mapSymbols":
        console.log(`${name}`, " was clicked");
        break;
      case "mapLayers":
        console.log(`${name}`, " was clicked");
        break;
      case "currentLocation":
        console.log(`${name}`, " was clicked");
        this.getLocation();
        break;

      // Map Actions
      case "zoom":
        console.log(`${name}`, " was clicked");
        break;
      case "saveMap":
        console.log(`${name}`, " was clicked");
        break;
      case "addTag":
        console.log(`${name}`, " was clicked");
        break;
      case "stereonet":
        console.log(`${name}`, " was clicked");
        break;

      // Map Layers
      case "satellite":
        // console.log(`${name}`, " was clicked");
        this.newBasemapDisplay(name);
        break;
      case "topo":
        // console.log(`${name}`, " was clicked");
        this.newBasemapDisplay(name);
        break;
      case "streets":
        // console.log(`${name}`, " was clicked");
        this.newBasemapDisplay(name);
        break;
      case "macrostrat":
        // console.log(`${name}`, " was clicked");
        this.newBasemapDisplay(name);
        break;
      case "geo&roads":
        // console.log(`${name}`, " was clicked");
        this.newBasemapDisplay(name);
        break;
    }
  };

  newBasemapDisplay = (name) => {
    console.log(name)
    this.mapViewElement.current.changeMap(name);
  };

  getLocation =  () => {
    this.mapViewElement.current.getCurrentLocation();
  };

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  toggleDialog = (dialog) => {
    this.setState(prevState =>{
      return {dialogs: {
          ...prevState.dialogs,
          [dialog]: !prevState.dialogs[dialog]
        }}
    })
  };

  dialogClickHandler = (dialog, name) => {
    this.clickHandler(name);
    this.toggleDialog(dialog);
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView ref={this.mapViewElement}/>

        <View style={styles.rightsideIcons}>
          <View style={styles.searchAndSettingsIcons}>
            <IconButton
              source={require('../assets/icons/SearchButton.png')}
              // onPress={this.clickHandler.bind(this, "search")}
            />
          </View>
          <View style={styles.tagIcon}>
            <IconButton
              source={require('../assets/icons/TagButton.png')}
              onPress={this.clickHandler.bind(this, "tag")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/MeasurementButton.png')}
              onPress={this.clickHandler.bind(this, "measurement")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/SampleButton.png')}
              onPress={this.clickHandler.bind(this, "sample")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              name={"Note"}
              source={require('../assets/icons/NoteButton.png')}
              onPress={this.clickHandler.bind(this, "note")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/PhotoButton.png')}
              onPress={this.clickHandler.bind(this, "photo")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/SketchButton.png')}
              onPress={this.clickHandler.bind(this, "sketch")}
            />
          </View>
          <View style={styles.notebookViewIcon}>
            <IconButton
              source={require('../assets/icons/NotebookViewButton.png')}
              onPress={this.clickHandler.bind(this, "notebook")}
            />
          </View>
        </View>
        <View style={styles.bottomRightIcons}>
          <View style={styles.pointIcon}>
            <IconButton
              source={require('../assets/icons/PointButton.png')}
              onPress={this.clickHandler.bind(this, "point")}
            />
          </View>
          <View style={styles.lineIcon}>
            <IconButton
              source={require('../assets/icons/LineButton.png')}
              onPress={this.clickHandler.bind(this, "line")}
            />
          </View>
          <View style={styles.polygonIcon}>
            <IconButton
              source={require('../assets/icons/PolygonButton.png')}
              onPress={this.clickHandler.bind(this, "polygon")}
            />
          </View>
        </View>
        <View style={styles.leftsideIcons}>
          <View style={styles.searchAndSettingsIcons}>
            <IconButton
              source={require('../assets/icons/SettingsButton.png')}
              onPress={this.clickHandler.bind(this, "settings")}
            />
          </View>
        </View>
        <View style={styles.bottomLeftIcons}>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/MapActionsButton.png')}
              onPress={() => this.toggleDialog("mapActionsMenuVisible")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/SymbolsButton.png')}
              onPress={() => this.toggleDialog("mapSymbolsMenuVisible")}
            />
          </View>
          <View style={styles.layersIcon}>
            <IconButton
              source={require('../assets/icons/LayersButton.png')}
              onPress={() => this.toggleDialog("baseMapMenuVisible")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/MyLocationButton.png')}
              onPress={this.clickHandler.bind(this, "currentLocation")}
            />
          </View>
        </View>
        <MapActionsDialog
          visible={this.state.dialogs.mapActionsMenuVisible}
          onPress={(name) => this.dialogClickHandler("mapActionsMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("mapActionsMenuVisible")}
        />
        <MapSymbolsDialog
          visible={this.state.dialogs.mapSymbolsMenuVisible}
          onPress={(name) => this.dialogClickHandler("mapSymbolsMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("mapSymbolsMenuVisible")}
        />
        <BaseMapDialog
          visible={this.state.dialogs.baseMapMenuVisible }
          onPress={(name) => this.dialogClickHandler("baseMapMenuVisible", name)}
          onTouchOutside={() => this.toggleDialog("baseMapMenuVisible")}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
