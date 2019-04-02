import React from 'react'
import {Text, View, Button} from 'react-native'
import styles from './Styles';
import {goToAuth, goToImages, goSignIn, goToSpotPage} from '../../routes/Navigation'
import {Navigation} from 'react-native-navigation';
import MapView from '../../maps/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from '../../shared/Icons';
import IconButton from '../../ui/IconButton';
import MapActionsDialog from '../../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../../components/modals/base-maps/BaseMapDialogBox";
import NotebookPanel from '../../components/notebook-panel/NotebookPanel';
import Drawer from 'react-native-drawer';
import SettingsPanel from '../../components/settings-panel/SettingsPanel';
import {MapModes} from '../../maps/map/Map.constants';
import ShortcutMenu from '../../components/settings-panel/shortcuts-menu/ShortcutsMenu';
import ManageOfflineMapsMenu from '../../components/settings-panel/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu';
import ButtonWithBackground from '../../ui/ButtonWithBackground';
import Modal from "react-native-modal";
import SaveMapModal from '../../components/modals/map-actions/SaveMapsModal';
import NotebookPanelMenu from '../../components/notebook-panel/NotebookPanelMenu';
import SpotName from '../../components/notebook-panel/SpotName';
import SpotCoords from '../../components/notebook-panel/SpotCoords';
import {connect} from 'react-redux';

class Home extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.mapViewElement = React.createRef();
    this.state = {
      dialogs: {
        mapActionsMenuVisible: false,
        mapSymbolsMenuVisible: false,
        baseMapMenuVisible: false,
        notebookPanelMenuVisible: false
      },
      buttons: {
        endDrawButtonVisible: false,
        drawButtonOn: undefined,
        cancelEditButtonVisible: false
      },
      mapMode: MapModes.VIEW,
      notebookPanelVisible: false,
      settingsMenuVisible: 'settingsMain',
      drawerVisible: false,
      isOfflineMapModalVisible: false,
      shortcutSwitchPosition: {
        Tag: false,
        Measurement: false,
        Sample: false,
        Note: false,
        Photo: false,
        Sketch: false
      },
      isShortcutButtonVisible: {
        Tag: false,
        Measurement: false,
        Sample: false,
        Note: false,
        Photo: false,
        Sketch: false
      },
      currentSpot: undefined
    };
    this.toggleCancelEditButton = this.toggleCancelEditButton.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    Icon.getImageSource("pin", 30)
  }

  componentWillUnmount() {
    this._isMounted = false;
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
        // console.log(`${name}`, " was clicked");
        goToImages();
        break;
      case "sketch":
        console.log(`${name}`, " was clicked");
        break;
      case "notebook":
        console.log(`${name}`, " was clicked");
        break;
      case "settings":
        console.log(`${name}`, " was clicked");
        this.openSettingsDrawer();
        break;

      // Notebook Panel three-dot menu
      case "closeNotebook":
        this.closeNotebookPanel();
        break;
      case 'copySpot':
        console.log('Spot Copied!');
        break;
      case 'deleteSpot':
        console.log('Spot Deleted!');
        break;

      // Map Actions
      case MapModes.DRAW.POINT:
        // this.mapViewElement.current.setPointAtCurrentLocation();
        this.map.setPointAtCurrentLocation();
        break;
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        console.log('Selected', name);
        if (this.state.mapMode === MapModes.VIEW) {
          this.setMapMode(name);
          this.toggleButton('endDrawButtonVisible');
        }
        else this.cancelDraw(name);
        break;
      case "endDraw":
        this.endDraw();
        break;
      case "cancelEdit":
        this.cancelEdit();
        break;
      case "currentLocation":
        console.log(`${name}`, " was clicked");
        // this.mapViewElement.current.goToCurrentLocation();
        this.map.goToCurrentLocation();
        break;

      // Map Actions
      case "zoom":
        console.log(`${name}`, " was clicked");
        break;
      case "saveMap":
        // Alert.alert('Hi buddy from Home Page')
        this.toggleModal()
        // this.mapViewElement.current.saveMap();
        // saveMap();
        break;
      case "addTag":
        console.log(`${name}`, " was clicked");
        break;
      case "stereonet":
        console.log(`${name}`, " was clicked");
        break;

      // Map Basemap Layers
      case "mapboxSatellite":
        this.newBasemapDisplay(name);
        break;
      case "mapboxOutdoors":
        this.newBasemapDisplay(name);
        break;
      case "osm":
        this.newBasemapDisplay(name);
        break;
      case "macrostrat":
        this.newBasemapDisplay(name);
        break;
      case "custom":
        this.newBasemapDisplay(name);
        break;
    }
  };

  newBasemapDisplay = (name) => {
    this.mapViewElement.current.changeMap(name);
  };

  setMapMode = mapMode => {
    if (this._isMounted) {
      this.setState(prevState => {
        if (prevState.mapMode === mapMode) mapMode = MapModes.VIEW;
        return {
          ...prevState,
          mapMode: mapMode
        }
      }, () => {
        console.log('Map Mode set to:', mapMode);
      });
    }
    else console.log('Attempting to set the state for the map mode but Home Component not mounted.');

  };

  cancelDraw = async (name) => {
    // await this.mapViewElement.current.cancelDraw();
    await this.map.cancelDraw();
    this.setMapMode(name);
    if (this.state.mapMode === MapModes.VIEW) this.toggleButton('endDrawButtonVisible');
  };

  endDraw = async () => {
    // await this.mapViewElement.current.endDraw();
    await this.map.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
  };

  cancelEdit = async () => {
    // await this.mapViewElement.current.cancelEdit();
    await this.map.cancelEdit();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('cancelEditButtonVisible');
  };

  notebookClickHandler = name => {
    if (name === 'menu') {
      this.toggleDialog('notebookPanelMenuVisible')
    }
    else if (name === 'export') {
      console.log('Export button was pressed')
    }
    else if (name === 'spotPage') {
      // goToSpotPage();
      Navigation.push(this.props.componentId, {
        component: {
          name: 'SpotPage'
        }
      });
  }
  };

  // Toggle given button between true (on) and false (off)
  toggleButton = (button) => {
    console.log('Toggle Button', button);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          buttons: {
            ...prevState.buttons,
            [button]: !prevState.buttons[button]
          }
        }
      });
    }
    else console.log('Attempting to toggle', button, 'but Home Component not mounted.');
  };

  toggleCancelEditButton = () => {
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('cancelEditButtonVisible');
  };

  // Toggle given dialog between true (visible) and false (hidden)
  toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          dialogs: {
            ...prevState.dialogs,
            [dialog]: !prevState.dialogs[dialog]
          }
        }
      }, () => console.log(dialog, 'is set to', this.state.dialogs[dialog]));
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  toggleDrawer = () => {
    // console.log('Toggle drawer');
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          drawerVisible: !prevState.drawerVisible
        }
      }, () => {
        console.log("DrawerVisible state", this.state.drawerVisible)
      });
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  toggleModal = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          isOfflineMapModalVisible: !prevState.isOfflineMapModalVisible
        }
      }, () => {
        console.log('Modal state', this.state.isOfflineMapModalVisible)
      })
    }
  };

  toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          shortcutSwitchPosition: {
            ...prevState.shortcutSwitchPosition,
            [switchName]: !prevState.shortcutSwitchPosition[switchName]
          },
          isShortcutButtonVisible: {
            ...prevState.isShortcutButtonVisible,
            [switchName]: !prevState.shortcutSwitchPosition[switchName]
          }
        }
      }, () => {
        console.log('Switch Position', this.state.shortcutSwitchPosition);
      });
    }
  };

  setVisibleMenuState = (state) => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          settingsMenuVisible: state
        }
      }, () => {
        console.log('State updated:', this.state);
      })
    }
  };

  closeSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.close();
    this.setVisibleMenuState('settingsMain');
    console.log("Drawer Closed");
  };

  openSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.open();
    console.log("Drawer Opened");
  };

  openNotebookPanel = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          notebookPanelVisible: true
        }
      }, () => {
        console.log('Noteboook panel open');
        // const selectedFeature = this.mapViewElement.current.getSelectedFeature();
        const selectedFeature = this.props.feature;
        console.log('Selected feature:', selectedFeature);
        this.setState(prevState => {
          return {
            ...prevState,
            currentSpot: selectedFeature
          }
        }, () => {
          console.log('Current spot state:', this.state.currentSpot)
        })
      });
    }
  };

  closeNotebookPanel = () => {
    if (this._isMounted) {
      this.setState({
        notebookPanelVisible: false
      });
    }
  };

  dialogClickHandler = (dialog, name) => {
    this.clickHandler(name);
    this.toggleDialog(dialog);
  };

  settingsClickHandler = (name) => {
    console.log(name);
    switch (name) {
      case "Shortcut Menu":
        console.log(name);
        this.setVisibleMenuState('Shortcut Menu');
        break;
      case 'Sign Out':
        break;
      case 'Manage Offline Maps':
        this.setVisibleMenuState('Manage Offline Maps');
        break;
    }
  };

  // converts the lat and lng from decimal form to minutes and seconds
  toDegreesMinutesAndSeconds = (coordinate) => {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + " " + minutes + " " + seconds;
  };

  // adds cardinal points to coordinates -- only works with single points
  convertDMS = (lat, lng) => {
    // var latitude = this.toDegreesMinutesAndSeconds(lat);
    const latitude = lat.toFixed(6);
    let latitudeCardinal = Math.sign(lat) >= 0 ? "North" : "South";

    // var longitude = this.toDegreesMinutesAndSeconds(lng);
    const longitude = lng.toFixed(6);
    let longitudeCardinal = Math.sign(lng) >= 0 ? "East" : "West";

    return (
      <Text>
      {latitude}&#176; {latitudeCardinal}, {longitude}&#176; {longitudeCardinal}
      </Text>
    )
  };

  getSpotCoords = () => {
    return this.props.feature.features.map(x => {
      const spotLat = x.geometry.coordinates[0];
      const spotLng = x.geometry.coordinates[1];
      const convertedLatLng = this.convertDMS(spotLat, spotLng);
      return (
        <SpotCoords
          key={x.properties.id}
          coords={convertedLatLng}/>
      );
    });
    // console.log('FU', this.state.currentSpot);
    // if (this.state.currentSpot) {
    //   const spotLat = this.state.currentSpot.geometry.coordinates[0];
    //   const spotLng = this.state.currentSpot.geometry.coordinates[1];
    //   const convertedLatLng = this.convertDMS(spotLat, spotLng);
    //   console.log('converted w direction', convertedLatLng);
    //   return convertedLatLng
    // }
    // return 'no spot coordinates'
  };

  getSpotName = () => {
    return this.props.feature.features.map(x => {
      return(
        <SpotName
          key={x.properties.id}
          name={x.properties.name}
        />
      );
    });
    // return this.props.selectedSpot;
    // console.log('Spot name', this.state.currentSpot);
    // if (this.state.currentSpot) {
    //   return this.state.currentSpot.properties.name;
    // }
    // return 'No Spot Selected';
  };

  render() {
    let content = null;
    let spotName = this.getSpotName();
    let spotCoords = this.getSpotCoords();

    if (this.state.settingsMenuVisible === 'settingsMain') {
      content = <SettingsPanel onPress={(name) => this.settingsClickHandler(name)}/>
    }
    else if (this.state.settingsMenuVisible === 'Shortcut Menu') {
      content =
        <ShortcutMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
          shortcutSwitchPosition={this.state.shortcutSwitchPosition}
        />
      }else if (this.state.settingsMenuVisible === 'Manage Offline Maps') {
        content =
        <ManageOfflineMapsMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
        />
      }
    return (
      <Drawer
        tweenHandler={(ratio) => ({
          main: {opacity: (2 - ratio) / 2}
        })}
        type={'displace'}
        ref={ref => this.drawer = ref}
        openDrawerOffset={.70}
        tapToClose={true}
        onClose={this.closeSettingsDrawer}
        content={content}
      >
        <View style={styles.container}>
          <MapView ref={this.mapViewElement}
                   onRef={ref => (this.map = ref)}
                   mapMode={this.state.mapMode}
                   toggleCancelEditButton={this.toggleCancelEditButton}/>
          {this.state.notebookPanelVisible ?
            <NotebookPanel
              spotName={spotName}
              spotCoords={spotCoords}
              textStyle={{fontWeight: 'bold', fontSize: 12}}
              onPress={(name) => this.notebookClickHandler(name)}
              onTouchOutside={() => this.toggleDialog("notebookPanelMenuVisible")}
            />
            : null}
          <View style={styles.topCenter}>
            {this.state.buttons.endDrawButtonVisible ?
              <ButtonWithBackground
                color={'yellow'}
                style={styles.buttonWithBackground}
                onPress={this.clickHandler.bind(this, "endDraw")}
              >
                <MaterialCommunityIcons.FontAwesome5
                  name={'user-edit'}
                  size={15}
                />
                End Draw</ButtonWithBackground>
              // <Button title={'End Draw'} onPress={this.clickHandler.bind(this, "endDraw")}/>
              : null}
            {this.state.buttons.cancelEditButtonVisible ?
              <ButtonWithBackground
                color={'yellow'}
                style={styles.buttonWithBackground}
                onPress={this.clickHandler.bind(this, "cancelEdit")}
              >Cancel Edit</ButtonWithBackground>
              // <Button title={'Cancel Edit'} onPress={this.clickHandler.bind(this, "cancelEdit")}
              : null}
          </View>
          <View style={styles.rightsideIcons}>
            <View style={styles.searchAndSettingsIcons}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/SearchButton.png')}
                // onPress={this.clickHandler.bind(this, "search")}
              />
            </View>
            <View style={styles.sideIconsGroupContainer}>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Tag ?
                  <IconButton
                    source={require('../../assets/icons/app-icons-shaded/TagButton.png')}
                    onPress={this.clickHandler.bind(this, "tag")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Measurement ?
                  <IconButton
                    source={require('../../assets/icons/app-icons-shaded/MeasurementButton.png')}
                    onPress={this.clickHandler.bind(this, "measurement")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Sample ?
                  <IconButton
                    source={require('../../assets/icons/app-icons-shaded/SampleButton.png')}
                    onPress={this.clickHandler.bind(this, "sample")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Note ?
                  <IconButton
                    name={"Note"}
                    source={require('../../assets/icons/app-icons-shaded/NoteButton.png')}
                    onPress={this.clickHandler.bind(this, "note")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Photo ?
                  <IconButton
                    source={require('../../assets/icons/app-icons-shaded/PhotoButton.png')}
                    onPress={this.clickHandler.bind(this, "photo")}
                  /> : null}
              </View>
              <View style={styles.sideIconsGroup}>
                {this.state.isShortcutButtonVisible.Sketch ?
                  <IconButton
                    source={require('../../assets/icons/app-icons-shaded/SketchButton.png')}
                    onPress={this.clickHandler.bind(this, "sketch")}
                  /> : null}
              </View>
            </View>
            <View style={styles.notebookViewIcon}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/NotebookViewButton.png')}
                onPress={() => this.openNotebookPanel()}
              />
            </View>
          </View>
          <View style={styles.bottomRightIcons}>
            <View style={styles.pointIcon}>
              <IconButton
                source={this.state.mapMode === MapModes.DRAW.POINT ?
                  require('../../assets/icons/app-icons-shaded/PointButton_pressed.png') : require(
                    '../../assets/icons/app-icons-shaded/PointButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POINT)}
              />
            </View>
            <View style={styles.lineIcon}>
              <IconButton
                source={this.state.mapMode === MapModes.DRAW.LINE ?
                  require('../../assets/icons/app-icons-shaded/LineButton_pressed.png') : require(
                    '../../assets/icons/app-icons-shaded/LineButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.LINE)}
              />
            </View>
            <View style={styles.polygonIcon}>
              <IconButton
                source={this.state.mapMode === MapModes.DRAW.POLYGON ?
                  require('../../assets/icons/app-icons-shaded/PolygonButton_pressed.png') :
                  require('../../assets/icons/app-icons-shaded/PolygonButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POLYGON)}
              />
            </View>
          </View>
          <View style={styles.leftsideIcons}>
            <View style={styles.searchAndSettingsIcons}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/SettingsButton.png')}
                onPress={this.clickHandler.bind(this, "settings")}
              />
            </View>
          </View>
          <View style={styles.bottomLeftIcons}>
            <View style={styles.sideIconsGroup}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/MapActionsButton.png')}
                onPress={() => this.toggleDialog("mapActionsMenuVisible")}
              />
            </View>
            <View style={styles.sideIconsGroup}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/SymbolsButton.png')}
                onPress={() => this.toggleDialog("mapSymbolsMenuVisible")}
              />
            </View>
            <View style={styles.layersIcon}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/LayersButton.png')}
                onPress={() => this.toggleDialog("baseMapMenuVisible")}
              />
            </View>
            <View style={styles.sideIconsGroup}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/MyLocationButton.png')}
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
            visible={this.state.dialogs.baseMapMenuVisible}
            onPress={(name) => this.dialogClickHandler("baseMapMenuVisible", name)}
            onTouchOutside={() => this.toggleDialog("baseMapMenuVisible")}
          />
          <NotebookPanelMenu
            visible={this.state.dialogs.notebookPanelMenuVisible}
            onPress={(name) => this.dialogClickHandler("notebookPanelMenuVisible", name)}
            onTouchOutside={() => this.toggleDialog("notebookPanelMenuVisible")}
          />
          <Modal
            isVisible={this.state.isOfflineMapModalVisible}
            useNativeDriver={true}
          >
            <View style={styles.modal}>
            <SaveMapModal
              close={this.toggleModal}
              map={this.mapViewElement.current}
            />
            </View>
          </Modal>
        </View>
      </Drawer>
    )
  }
}

function mapStateToProps(state) {
  return {
    selectedSpot: state.currentSpot,
    feature: state.home.featureCollectionSelected
  }
}

export default connect(mapStateToProps)(Home);
