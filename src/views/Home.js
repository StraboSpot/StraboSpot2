import React from 'react'
import {
  Alert,
  Image,
  View,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import {goToAuth, goSignIn} from '../routes/Navigation'
import MapView from '../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonWithBackground from '../ui/ButtonWithBackground';
import IconButton from '../ui/IconButton';
import Dialog, {DialogButton, DialogTitle, DialogContent} from 'react-native-popup-dialog';

export default class Home extends React.Component {
  componentDidMount() {
    Icon.getImageSource("pin", 30)
  }

  state = {
    mapActionsMenuVisible: false
  };

  logout = () => {
    goSignIn();
  };

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
        break;
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
    }
    this.setState({mapActionsMenuVisible: false});
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView/>
        <Dialog dialogStyle={{position: 'absolute', bottom: 10, left: 70}}
                visible={this.state.mapActionsMenuVisible}
                dialogTitle={<DialogTitle title="Map Actions"/>}
                onTouchOutside={() => {
                  this.setState({mapActionsMenuVisible: false});
                }}
        >
          <DialogContent>
            <DialogButton
              text="Zoom to Extent of Spots"
              onPress={() => {
                this.clickHandler("zoom")
              }}
            />
            <DialogButton
              text="Save Map for Offline Use"
              onPress={() => {
                this.clickHandler("saveMap")
              }}
            />
            <DialogButton
              text="Add Tag(s) to Spot(s)"
              onPress={() => {
                this.clickHandler("addTag")
              }}
            />
            <DialogButton
              text="Lasso Spots for Stereonet"
              onPress={() => {
                this.clickHandler("stereonet")
              }}
            />
          </DialogContent>
        </Dialog>

        <View style={styles.rightsideIcons}>
          <View style={styles.searchAndSettingsIcons}>
            <IconButton
              source={require('../assets/icons/SearchButton.png')}
              onPress={this.clickHandler.bind(this, "search")}
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
          <View style={styles.mapActionsIcon}>
            <IconButton
              source={require('../assets/icons/MapActionsButton.png')}
              onPress={() => {
                this.setState({mapActionsMenuVisible: true});
              }}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/SymbolsButton.png')}
              onPress={this.clickHandler.bind(this, "mapSymbols")}
            />
          </View>
          <View style={styles.sideIconsGroup}>
            <IconButton
              source={require('../assets/icons/LayersButton.png')}
              onPress={this.clickHandler.bind(this, "mapLayers")}
            />
          </View>
        </View>
        <View style={styles.bottomLeftIcons}>
          <View style={styles.currentLocationIcon}>
            <IconButton
              source={require('../assets/icons/MyLocationButton.png')}
              onPress={this.clickHandler.bind(this, "currentLocation")}
            />
          </View>
        </View>
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
    right: 10
  },

  // --- All icons with group spacings (margins of 55) on left and right sides ---
  sideIconsGroup: {
    marginTop: 60
  },

  // --- Bottom icons (line, polygon, and point) ---

  bottomRightIcons: {
    position: "absolute",
    bottom: 100,
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
    bottom: 100,
    left: 70
  },
  currentLocation: {
    marginBottom: 55
  },

  // --- Icons with specialized margins ---
  mapActionsIcon: {
    marginTop: 415
  },
  notebookViewIcon: {
    marginTop: 105
  },
  searchAndSettingsIcons: {
    marginTop: 35
  },
  tagIcon: {
    marginTop: 145
  },

  dialog: {
    position: 'absolute',
    bottom: 10
  }
});