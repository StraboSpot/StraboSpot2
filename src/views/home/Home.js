import React from 'react'
import {Alert, Text, View, Button} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import ImagePicker from 'react-native-image-picker';
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
import {ADD_PHOTOS, FEATURE_DELETE, SET_ISONLINE, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {saveFile} from '../../services/images/ImageDownload';
import {takePicture} from '../../shared/HelperFunctions/ImageHelperFunctions';
import {IMAGES} from "../../routes/ScreenNameConstants";

const imageOptions = {
  storageOptions: {
    skipBackup: true,
    // path: 'StraboSpot/Images',
    takePhotoButtonTitle: 'Take Photo Buddy!',
    chooseFromLibraryButtonTitle: 'choose photo from library'
  }
};

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
        drawButtonsVisible: true,
        editButtonsVisible: false
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
      currentSpot: undefined,
      allPhotosSaved: []
    };
  }

  componentDidMount() {
    this._isMounted = true;
    Icon.getImageSource("pin", 30);
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  cancelEdits = async () => {
    await this.mapViewComponent.cancelEdits();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('editButtonsVisible', false);
    this.toggleButton('drawButtonsVisible', true);
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
        this.takePicture();
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
      case 'copyFeature':
        console.log('Spot Copied!');
        break;
      case 'deleteFeature':
        console.log('Feature Deleted!', this.props.selectedSpot.properties.id);
        this.deleteSelectedFeature(this.props.selectedSpot.properties.id);
        break;
      case 'editFeature':
        this.props.setPageVisible(SpotPages.BASIC);

      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        console.log('Selected', name);
        this.setDraw(name);
        break;
      case "endDraw":
        this.endDraw();
        break;
      case "cancelEdits":
        this.cancelEdits();
        break;
      case "saveEdits":
        this.saveEdits();
        break;
      case "currentLocation":
        console.log(`${name}`, " was clicked");
        this.mapViewComponent.goToCurrentLocation();
        break;

      // Map Actions
      case "zoom":
        console.log(`${name}`, " was clicked");
        break;
      case "saveMap":
        this.toggleModal();
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

  closeNotebookPanel = () => {
    if (this._isMounted) {
      this.setState({
        notebookPanelVisible: false
      });
    }
  };

  closeSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.close();
    this.setVisibleMenuState('settingsMain');
    console.log("Drawer Closed");
  };

  convertDMS = (lat, lng) => {
    const latitude = lat.toFixed(6);
    let latitudeCardinal = Math.sign(lat) >= 0 ? "North" : "South";

    const longitude = lng.toFixed(6);
    let longitudeCardinal = Math.sign(lng) >= 0 ? "East" : "West";

    return (
      <Text>
        {latitude}&#176; {latitudeCardinal}, {longitude}&#176; {longitudeCardinal}
      </Text>
    )
  };

  deleteSelectedFeature = (id) => {
    const featureName = this.props.selectedSpot.properties.name;
    Alert.alert(
      'Delete Feature?',
      `Are you sure you want to delete feature: \n ${featureName}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Presed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            this.props.deleteFeature(id);
            this.closeNotebookPanel()
          }
        }
      ]
    );
  };

  dialogClickHandler = (dialog, name) => {
    this.clickHandler(name);
    this.toggleDialog(dialog);
  };

  endDraw = () => {
    this.mapViewComponent.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
  };

  getSpotCoordsComponent = (spot) => {
    if (spot.geometry.type === 'Point') {
      const spotLng = spot.geometry.coordinates[0];
      const spotLat = spot.geometry.coordinates[1];
      const convertedLatLng = this.convertDMS(spotLat, spotLng);
      return (
        <SpotCoords
          key={spot.properties.id}
          coords={convertedLatLng}/>
      );
    }
    else {
      return (
        <SpotCoords
          key={spot.properties.id}
          coords={spot.geometry.type}/>
      );
    }
  };

  getSpotNameComponent = (spot) => {
    return (
      <SpotName
        key={spot.properties.id}
        name={spot.properties.name}
      />
    );
  };

  //function for online/offline state change event handler
  handleConnectivityChange = (isConnected) => {
    this.props.setIsOnline( isConnected );
  }

  mapPress = () => {
    return this.mapViewComponent.getCurrentBasemap();
  };

  newBasemapDisplay = (name) => {
    this.mapViewComponent.changeMap(name);
  };

  notebookClickHandler = (name) => {
    switch (name) {
      case 'menu':
        this.toggleDialog('notebookPanelMenuVisible');
        break;
      case  'export':
        console.log('Export button was pressed');
        break;
      case 'camera':
        // console.log('Camera button was pressed');
        this.launchCamera();
        break;
    }
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
        this.props.setPageVisible(SpotPages.OVERVIEW)
      });
    }
  };

  launchCamera = async () => {
    const savedPhoto = await takePicture();
    // console.log('savedPhoto res', savedPhoto);

    if (savedPhoto === 'cancelled') {
      if (this.state.allPhotosSaved.length > 0) {
        console.log('ALL PHOTOS SAVED', this.state.allPhotosSaved);
        this.props.addPhoto(this.state.allPhotosSaved);
        this.state.allPhotosSaved = [];
        Alert.alert('Photo Saved!', 'Thank you!')
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...')
      }

    }
    else {
      this.setState(prevState => {
        return {
          ...prevState,
          allPhotosSaved: [...this.state.allPhotosSaved, savedPhoto]
        }
      }, () => {
        console.log('All Photos Saved:', this.state.allPhotosSaved);
        this.launchCamera();
      });
    }
  };

  setDraw = async mapMode => {
    this.mapViewComponent.cancelDraw();
    if (this.state.mapMode === MapModes.VIEW) this.toggleButton('endDrawButtonVisible');
    else if (this.state.mapMode === mapMode) mapMode = MapModes.VIEW;
    await this.setMapMode(mapMode);
    if (this.state.mapMode === MapModes.DRAW.POINT) {
      await this.mapViewComponent.setPointAtCurrentLocation();
      await this.setMapMode(MapModes.VIEW);
      this.toggleButton('endDrawButtonVisible');
    }
    if (mapMode === MapModes.VIEW) this.toggleButton('endDrawButtonVisible');
  };

  setMapMode = async (mapMode) => {
    if (this._isMounted) {
      this.setState(prevState => {
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
      case 'Image Gallery':
        goToImages();
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

  saveEdits = async () => {
    this.mapViewComponent.saveEdits();
    this.cancelEdits();
  };

  startEdit = () => {
    this.setMapMode(MapModes.EDIT);
    this.toggleButton('editButtonsVisible', true);
    this.toggleButton('drawButtonsVisible', false);
  };

  takePicture = async (photo) => {
    // let savedPhoto = await takePicture(photo)

    ImagePicker.launchCamera(imageOptions, async (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
        await this.props.addPhoto(this.state.allPhotosSaved);
        alert('Photos Saved!')
      }
      else if (response.error) console.log('ImagePicker Error: ', response.error);
      else {
        console.log('takePicture()', response);
        const savedPhoto = await saveFile(response.uri);
        this.setState(prevState => {
          return {
            ...prevState,
            allPhotosSaved: [...this.state.allPhotosSaved, savedPhoto]
          }
        }, () => {
          console.log('All Photos Saved:', this.state.allPhotosSaved);
          this.takePicture();
        })
      }
      // const savedPhoto = await saveFile(res.uri);
      // console.log(savedPhoto);
      // this.props.addPhoto(savedPhoto);
    });
  };

  // Toggle given button between true (on) and false (off)
  toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !this.state.buttons[button]);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          buttons: {
            ...prevState.buttons,
            [button]: isVisible ? isVisible : !prevState.buttons[button]
          }
        }
      });
    }
    else console.log('Attempting to toggle', button, 'but Home Component not mounted.');
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

  render() {
    const spot = this.props.selectedSpot;

    const isOnline = this.props.isOnline;

    let content = null;
    let spotName = Object.getOwnPropertyNames(spot).length !== 0 ? this.getSpotNameComponent(spot) : undefined;
    let spotCoords = Object.getOwnPropertyNames(spot).length !== 0 ? this.getSpotCoordsComponent(spot) : undefined;

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
    }
    else if (this.state.settingsMenuVisible === 'Manage Offline Maps') {
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
                   onRef={ref => (this.mapViewComponent = ref)}
                   mapMode={this.state.mapMode}
                   startEdit={this.startEdit}/>
          {this.state.notebookPanelVisible ?
            <NotebookPanel
              closeNotebook={this.closeNotebookPanel}
              spotName={spotName}
              spotCoords={spotCoords}
              textStyle={{fontWeight: 'bold', fontSize: 12}}
              onPress={(name) => this.notebookClickHandler(name)}
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
                  size={15}/>
                End Draw
              </ButtonWithBackground>
              : null}
            {this.state.buttons.editButtonsVisible ?
              <View>
                <ButtonWithBackground
                  color={'yellow'}
                  style={styles.buttonWithBackground}
                  onPress={this.clickHandler.bind(this, "saveEdits")}>
                  Save Edits
                </ButtonWithBackground>
                <ButtonWithBackground
                  color={'yellow'}
                  style={styles.buttonWithBackground}
                  onPress={this.clickHandler.bind(this, "cancelEdits")}>
                  Cancel Edits
                </ButtonWithBackground>
              </View>
              : null}
          </View>
          <View style={styles.settingsIconContainer}>
            <IconButton
              source={require('../../assets/icons/app-icons-shaded/SearchButton.png')}
              // onPress={this.clickHandler.bind(this, "search")}
            />
          </View>
          <View style={styles.rightsideIcons}>
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

          </View>
          <View style={styles.notebookViewIcon}>
            <IconButton
              source={require('../../assets/icons/app-icons-shaded/NotebookViewButton.png')}
              onPress={() => this.openNotebookPanel()}
            />
          </View>
          <View style={styles.bottomRightIcons}>
            {/* displays the Online boolean in text*/}
            {/*<View><Text>Online: {this.props.isOnline.toString()}</Text></View> */}

            {this.state.buttons.drawButtonsVisible ?
              <View style={styles.drawToolsContainer}>
                <IconButton
                  source={this.state.mapMode === MapModes.DRAW.POLYGON ?
                    require('../../assets/icons/app-icons-shaded/PolygonButton_pressed.png') :
                    require('../../assets/icons/app-icons-shaded/PolygonButton.png')}
                  onPress={this.clickHandler.bind(this, MapModes.DRAW.POLYGON)}
                />
                <IconButton
                  source={this.state.mapMode === MapModes.DRAW.LINE ?
                    require('../../assets/icons/app-icons-shaded/LineButton_pressed.png') : require(
                      '../../assets/icons/app-icons-shaded/LineButton.png')}
                  onPress={this.clickHandler.bind(this, MapModes.DRAW.LINE)}
                />
                <IconButton
                  source={this.state.mapMode === MapModes.DRAW.POINT ?
                    require('../../assets/icons/app-icons-shaded/PointButton_pressed.png') : require(
                      '../../assets/icons/app-icons-shaded/PointButton.png')}
                  onPress={this.clickHandler.bind(this, MapModes.DRAW.POINT)}
                />
              </View>
              : null}
          </View>
          <View style={styles.searchIconContainer}>
            <IconButton
              source={require('../../assets/icons/app-icons-shaded/SettingsButton.png')}
              onPress={this.clickHandler.bind(this, "settings")}
            />
          </View>
          <View style={styles.leftsideIcons}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/MapActionsButton.png')}
                onPress={() => this.toggleDialog("mapActionsMenuVisible")}
              />
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/SymbolsButton.png')}
                onPress={() => this.toggleDialog("mapSymbolsMenuVisible")}
              />
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/LayersButton.png')}
                onPress={() => this.toggleDialog("baseMapMenuVisible")}
              />
          </View>
          <View style={styles.bottomLeftIcons}>
              <IconButton
                source={require('../../assets/icons/app-icons-shaded/MyLocationButton.png')}
                onPress={this.clickHandler.bind(this, "currentLocation")}
              />
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
                map={this.mapViewComponent}
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
    selectedSpot: state.home.selectedSpot,
    featureCollectionSelected: state.home.featureCollectionSelected,
    isOnline: state.home.isOnline
  }
}

const mapDispatchToProps = {
  setIsOnline: (online) => ({type: SET_ISONLINE, online: online}),
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page}),
  addPhoto: (image) => ({type: ADD_PHOTOS, image: image}),
  deleteFeature: (id) => ({type: FEATURE_DELETE, id: id})
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
