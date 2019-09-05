import React from 'react'
import {Alert, Animated, Dimensions, Easing, Platform, Text, View} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import ImagePicker from 'react-native-image-picker';
import styles from './Styles';
import MapView from '../../components/maps/MapView';
import vectorIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from '../../shared/Icons';
import IconButton from '../../shared/ui/IconButton';
import MapActionsDialog from '../../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../../components/modals/base-maps/BaseMapDialogBox";
import NotebookPanel from '../../components/notebook-panel/NotebookPanel';
import SettingsPanel from '../../components/settings-panel/SettingsPanel';
import {MapModes} from '../../components/maps/Map.constants';
import {SettingsMenuItems} from '../../components/settings-panel/SettingsMenu.constants';
import ImageGallery from '../../components/images/ImageGallery.view';
import ShortcutMenu from '../../components/settings-panel/shortcuts-menu/ShortcutsMenu';
import ManageOfflineMapsMenu from '../../components/maps/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu';
import CustomMapsMenu from '../../components/maps/Custom-Maps-Menu/CustomMapsMenu';
import ButtonWithBackground from '../../shared/ui/ButtonWithBackground';
import Modal from "react-native-modal";
import SaveMapModal from '../../components/modals/map-actions/SaveMapsModal';
import NotebookPanelMenu from '../../components/notebook-panel/NotebookPanelMenu';
import {connect} from 'react-redux';
import {NotebookPages, notebookReducers} from "../../components/notebook-panel/Notebook.constants";
import {spotReducers} from "../../spots/Spot.constants";
import {imageReducers} from "../../components/images/Image.constants";
import {saveFile} from '../../services/images/ImageDownload';
import {takePicture} from '../../components/images/Images.container';
import NotebookCompassModal from "../../components/measurements/compass/NotebookCompassModal";
import ShortcutCompassModal from '../../components/measurements/compass/ShortcutCompassModal';
import NotebookSamplesModal from '../../components/samples/NotebookSamplesModal.view';
import ShortcutSamplesModal from '../../components/samples/ShortcutSamplesModal.view';
import SpotsList from '../../spots/SpotsList';
import AllSpotsView from '../../components/notebook-panel/AllSpots.view';
import {homeReducers, Modals} from "./Home.constants";
import sampleStyles from '../../components/samples/samples.style';
import notebookStyles from '../../components/notebook-panel/NotebookPanel.styles';
import Orientation from "react-native-orientation-locker";
import {Directions, FlingGestureHandler, State} from "react-native-gesture-handler";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
// import {SettingsPanel,  ShortcutMenu} from '../../components/settings-panel/index';
import SettingsPanelHeader from '../../components/settings-panel/SettingsPanelHeader';
import {Button, Image} from "react-native-elements";

const deviceWidth = () => {
  if (width < 500) return wp('95%');
  if (width >= 500 && width <= 1000) return wp('50%');
  if (width > 1000) return wp('40%');
};
const platformType = Platform.OS === 'ios' ? 'window' : 'screen';
const width = Dimensions.get(platformType).width;
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
  dimensions = Dimensions.get(platformType);

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
      settingsMenuVisible: SettingsMenuItems.SETTINGS_MAIN,
      drawerVisible: false,
      isOfflineMapModalVisible: false,
      currentSpot: undefined,
      allPhotosSaved: [],
      // isAllSpotsPanelVisible: false,
      animation: new Animated.Value(deviceWidth()),
      settingsPanelAnimation: new Animated.Value(-deviceWidth()),
      allSpotsViewAnimation: new Animated.Value(125)
    };
  }

  componentDidMount() {
    this._isMounted = true;
    vectorIcon.getImageSource("pin", 30);
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    // this.props.setDeviceDims(this.dimensions);
    if (this.props.deviceDimensions.width < 500) {
      Orientation.unlockAllOrientations();
    }
    else Orientation.lockToLandscapeLeft();
    Dimensions.addEventListener('change', this.deviceOrientation);
    this.props.setNotebookPanelVisible(false);
    this.props.setAllSpotsPanelVisible(false);
    this.props.setModalVisible(null);
  }

  componentWillUnmount() {
    this._isMounted = false;
    Dimensions.removeEventListener('change', this.deviceOrientation);
    console.log('All listeners removed')
  }

  deviceOrientation = () => {
    const dimensions = Dimensions.get(platformType);
    this.props.setDeviceDims(dimensions);
    console.log(this.props.deviceDimensions)
  };

  deviceWidth = () => {
    if (width < 500) return wp('95%');
    if (width >= 500 && width <= 1000) return wp('50%');
    if (width > 1000) return wp('40%');
  };

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
        this.props.setModalVisible(Modals.SHORTCUT_MODALS.COMPASS);
        break;
      case "sample":
        this.props.setModalVisible(Modals.SHORTCUT_MODALS.SAMPLE);
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
        this.openSettingsDrawer();
        break;

      // Notebook Panel three-dot menu
      case "closeNotebook":
        this.closeWholeNotebookPanel();
        break;
      case 'copyFeature':
        console.log('Spot Copied!');
        break;
      case 'deleteFeature':
        console.log('Feature Deleted!', this.props.selectedSpot.properties.id);
        this.deleteSelectedFeature(this.props.selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        this.openAllSpotsPanel();
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
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
        this.mapViewComponent.goToCurrentLocation();
        break;

      // Map Actions
      case "zoom":
        console.log(`${name}`, " was clicked");
        break;
      case "saveMap":
        this.toggleOfflineMapModal();
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

  closeAllSpotsPanel = () => {
    this.props.setAllSpotsPanelVisible(false);
  };

  flingHandlerSettingsPanel = ({nativeEvent}) => {
    if (this._isMounted) {
      if (nativeEvent.oldState === State.ACTIVE) {
        console.log('FLING TO CLOSE Settings Panel!', nativeEvent);
        Animated.timing(this.state.settingsPanelAnimation, {
          toValue: -deviceWidth(),
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true
        }).start(() => {
        });
      }
    }
  };

  flingHandler = ({nativeEvent}) => {
    if (this._isMounted) {
      if (nativeEvent.oldState === State.ACTIVE) {
        console.log('FLING TO CLOSE NOTEBOOK!', nativeEvent);
        this.props.setAllSpotsPanelVisible(false);
        Animated.timing(this.state.animation, {
          toValue: this.deviceWidth(),
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true
        }).start(() => {
          // this.props.setNotebookPanelVisible(false);
          // this.props.setModalVisible(null);
          this.closeWholeNotebookPanel();
        });
        Animated.timing(this.state.allSpotsViewAnimation, {
          toValue: 125,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true
        }).start();
      }
    }
  };

  closeNotebookPanel = () => {
    if (this._isMounted) {
      console.log('closing notebook');
      Animated.timing(this.state.animation, {
        toValue: this.deviceWidth(),
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }).start(() => {
          this.props.setNotebookPanelVisible(false);
          this.props.setAllSpotsPanelVisible(false);
        }
      )
    }
  };

  closeWholeNotebookPanel = () => {
    if (this._isMounted) {
      console.log('closing Whole notebook');
      this.props.setModalVisible(null);
      Animated.timing(this.state.animation, {
        toValue: this.deviceWidth(),
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }).start(() => {
          this.props.setNotebookPanelVisible(false);
          this.props.setAllSpotsPanelVisible(false);
        }
      )
    }
  };

  closeSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.close();
    this.setVisibleMenuState(SettingsMenuItems.SETTINGS_MAIN);
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

  endDraw = async () => {
    this.mapViewComponent.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
    this.openNotebookPanel()
  };

  getImageSrc = (id) => {
    return this.props.imagePaths[id]
  };

  getSpotFromId = (spotId) => {
    const spot = this.props.spot.find((spot) => {
      return spot.properties.id === spotId
    });
    // console.log('Aaaaaaaa', spot);
    this.props.onFeatureSelected(spot);
    this.openNotebookPanel()
  };

//function for online/offline state change event handler
  handleConnectivityChange = (isConnected) => {
    this.props.setIsOnline(isConnected);
  };

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
        this.launchCameraFromNotebook();
        break;
    }
  };

  openSettingsDrawer = () => {
    if (this._isMounted) {
      this.setVisibleMenuState(SettingsMenuItems.SETTINGS_MAIN)
      Animated.timing(this.state.settingsPanelAnimation, {
        toValue: 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }).start(() => {
        this.props.setNotebookPanelVisible(true);
      });
    }
  };

  openNotebookPanel = (pageView) => {
    if (this._isMounted) {
      console.log('notebook opening', pageView);
      this.props.setNotebookPageVisible(pageView);
      this.props.setAllSpotsPanelVisible(false);
      Animated.timing(this.state.animation, {
        toValue: wp('0%'),
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }).start(() => {
        this.props.setNotebookPanelVisible(true);
      });
    }
  };

  launchCameraFromNotebook = async () => {
    let imageArr = this.state.allPhotosSaved;
    try {
      const savedPhoto = await takePicture();
      if (savedPhoto === 'cancelled') {
        if (this.state.allPhotosSaved.length > 0) {
          console.log('ALL PHOTOS SAVED', this.state.allPhotosSaved);
          this.props.addPhoto(imageArr);
          this.props.onSpotEditImageObj(imageArr);
          this.state.allPhotosSaved = [];
          // Alert.alert('Photo Saved!', 'Thank you!')
        }
        else {
          Alert.alert('No Photos To Save', 'please try again...')
        }

      }
      else {
        this.setState(prevState => {
          return {
            ...prevState,
            allPhotosSaved: [...this.state.allPhotosSaved, {
              id: savedPhoto.id,
              src: savedPhoto.src,
              image_type: 'photo',
              height: savedPhoto.height,
              width: savedPhoto.width
            }]
          }
        }, () => {
          console.log('All Photos Saved:', this.state.allPhotosSaved);
          this.launchCameraFromNotebook();
        });
      }
    } catch (e) {
      Alert.alert('Error Getting Photo!');
    }
  };

  samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected')
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
      // this.openNotebookPanel();
      this.props.setNotebookPanelVisible(true);
      this.props.setNotebookPageVisible(NotebookPages.OVERVIEW);
      Animated.timing(this.state.animation, {
        toValue: wp('0%'),
        duration: 350,
        easing: Easing.linear,
        useNativeDriver: true
      }).start();
    }
    if (mapMode === MapModes.VIEW) {
      this.toggleButton('endDrawButtonVisible');
    }
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
    ImagePicker.launchCamera(imageOptions, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        await this.props.addPhoto(this.state.allPhotosSaved);
        // alert('Photos Saved!')
      }
      else if (response.error) console.log('ImagePicker Error: ', response.error);
      else {
        console.log('takePicture()', response);
        const savedPhoto = await saveFile(response);
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
      });
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  toggleImageModal = () => {
    if (this._isMounted) {
      this.props.setIsImageModalVisible(!this.props.isImageModalVisible);
    }
  };

  toggleOfflineMapModal = () => {
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
      this.props.onShortcutSwitchChange(switchName);
      console.log(this.props.shortcutSwitchPosition);
    }
  };

  modalHandler = (page, modalType) => {
    if (this.props.isNotebookPanelVisible) {
      console.log('NBS NBModal press in SampleOnPress', page);
      this.closeNotebookPanel();
      this.props.setModalVisible(modalType);

    }
    else {
      this.openNotebookPanel(page);
      this.props.setModalVisible(modalType);
    }
  };

  render() {
    const spot = this.props.selectedSpot;
    const isOnline = this.props.isOnline;
    const animateNotebookMenu = {
      transform: [
        {translateX: this.state.animation}
      ]
    };
    const animateSettingsPanel = {
      transform: [
        {translateX: this.state.settingsPanelAnimation}
      ]
    };
    const animateAllSpotsMenu = {
      transform: [
        {translateX: this.state.allSpotsViewAnimation}
      ]
    };
    let settingsPanelHeader = <SettingsPanelHeader onPress={() => this.setVisibleMenuState(SettingsMenuItems.SETTINGS_MAIN)}>
      {this.state.settingsMenuVisible}
    </SettingsPanelHeader>;
    let content = null;
    let compassModal = null;
    let samplesModal = null;
    let notebookPanel = null;
    let settingsDrawer = null;

    notebookPanel =
      <FlingGestureHandler
        direction={Directions.RIGHT}
        numberOfPointers={1}
        // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
        onHandlerStateChange={(ev) => this.flingHandler(ev)}
      >
        <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
          <NotebookPanel
            onHandlerStateChange={(ev, name) => this.flingHandler(ev, name)}
            closeNotebook={this.closeWholeNotebookPanel}
            textStyle={{fontWeight: 'bold', fontSize: 12}}
            onPress={(name) => this.notebookClickHandler(name)}
          >
            <AllSpotsView/>
          </NotebookPanel>
        </Animated.View>
      </FlingGestureHandler>;

    // Renders Compass modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
      compassModal =
        <NotebookCompassModal
          close={() => this.props.setModalVisible(null)}
          onPress={(page) => this.modalHandler(page, Modals.SHORTCUT_MODALS.COMPASS)}
        />;
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      compassModal =
        <ShortcutCompassModal
          close={() => this.props.setModalVisible(null)}
          onPress={(page) => this.modalHandler(page, Modals.NOTEBOOK_MODALS.COMPASS)}
        />;
    }

    // Renders Samples modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE) {
      samplesModal = (
        <NotebookSamplesModal
          close={() => this.props.setModalVisible(null)}
          cancel={() => this.samplesModalCancel()}
          onPress={(page) => this.modalHandler(page, Modals.SHORTCUT_MODALS.SAMPLE)}
        />
      )
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      samplesModal =
        <View
          style={sampleStyles.modalPositionShortcutView}>
          <ShortcutSamplesModal
            close={() => this.props.setModalVisible(null)}
            cancel={() => this.samplesModalCancel()}
            style={{justifyContent: 'center'}}
            onPress={(page) => this.modalHandler(page, Modals.NOTEBOOK_MODALS.SAMPLE)}
          />
        </View>
    }

    switch (this.state.settingsMenuVisible) {
      case SettingsMenuItems.APP_PREFERENCES.SHORTCUTS:
        content =
          <View style={styles.settingsPanelContainer}>
            {settingsPanelHeader}
            <ShortcutMenu
              toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
              shortcutSwitchPosition={this.props.shortcutSwitchPosition}
            />
          </View>;
        break;
      case SettingsMenuItems.MAPS.MANAGE_OFFLINE_MAPS:
        content =
          <View style={styles.settingsPanelContainer}>
            {settingsPanelHeader}
            <ManageOfflineMapsMenu
              toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
              closeSettingsDrawer={() => this.closeSettingsDrawer()}
            />
          </View>;
        break;
      case SettingsMenuItems.MAPS.CUSTOM:
        content =
          <View style={styles.settingsPanelContainer}>
            {settingsPanelHeader}
            <CustomMapsMenu
              toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
              closeSettingsDrawer={() => this.closeSettingsDrawer()}
            />
          </View>;
        break;
      case SettingsMenuItems.ATTRIBUTES.IMAGE_GALLERY:
        content =
          <View style={styles.settingsPanelContainer}>
            {settingsPanelHeader}
            <ImageGallery
              getSpotData={(spotId) => this.getSpotFromId(spotId)}
            />
          </View>;
        break;
      case SettingsMenuItems.ATTRIBUTES.SPOTS_LIST:
        content =
          <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <SpotsList
            getSpotData={(spotId) => this.getSpotFromId(spotId)}
          />
          </View>;
        break;
      default:
        content = <SettingsPanel onPress={(name) => this.setVisibleMenuState(name)}/>
    }

    settingsDrawer =
      <FlingGestureHandler
        direction={Directions.LEFT}
        numberOfPointers={1}
        // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
        onHandlerStateChange={(ev) => this.flingHandlerSettingsPanel(ev)}
      >
        <Animated.View style={[styles.settingsDrawer, animateSettingsPanel]}>
          {content}
        </Animated.View>
      </FlingGestureHandler>;

    return (
        <View style={styles.container}>
          <MapView ref={this.mapViewElement}
                   onRef={ref => (this.mapViewComponent = ref)}
                   mapMode={this.state.mapMode}
                   startEdit={this.startEdit}
          />
          {/*{this.props.isNotebookPanelVisible && notebookPanel}*/}
          {notebookPanel}
          {settingsDrawer}
          {(this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}
          {this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
          this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? samplesModal : null}
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
          <View style={styles.searchIconContainer}>
            <IconButton
              source={require('../../assets/icons/SearchButton.png')}
              onPress={this.clickHandler.bind(this, "search")}
            />
          </View>
          <View style={styles.rightsideIcons}>
            {this.props.shortcutSwitchPosition.Tag ?
              <IconButton
                source={require('../../assets/icons/TagButton.png')}
                onPress={this.clickHandler.bind(this, "tag")}
              /> : null}
            {this.props.shortcutSwitchPosition.Measurement ?
              <IconButton
                source={this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? require(
                  '../../assets/icons/MeasurementButton_pressed.png')
                  : require('../../assets/icons/MeasurementButton.png')}
                onPress={this.clickHandler.bind(this, "measurement")}
              /> : null}
            {this.props.shortcutSwitchPosition.Sample ?
              <IconButton
                source={this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? require(
                  '../../assets/icons/SampleButton_pressed.png')
                  : require('../../assets/icons/SampleButton.png')}
                onPress={this.clickHandler.bind(this, "sample")}
              /> : null}
            {this.props.shortcutSwitchPosition.Note ?
              <IconButton
                name={"Note"}
                source={require('../../assets/icons/NoteButton.png')}
                onPress={this.clickHandler.bind(this, "note")}
              /> : null}
            {this.props.shortcutSwitchPosition.Photo ?
              <IconButton
                source={require('../../assets/icons/PhotoButton.png')}
                onPress={this.clickHandler.bind(this, "photo")}
              /> : null}
            {this.props.shortcutSwitchPosition.Sketch ?
              <IconButton
                source={require('../../assets/icons/SketchButton.png')}
                onPress={this.clickHandler.bind(this, "sketch")}
              /> : null}
          </View>
          <View style={styles.notebookViewIcon}>
            {this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? null : <IconButton
              source={require('../../assets/icons/NotebookViewButton.png')}
              onPress={() => this.openNotebookPanel()}
            />}
          </View>
          {/*<View style={this.props.isNotebookPanelVisible ? styles.bottomRightIconsShortcutModal*/}
          {/*: styles.bottomRightIcons}>*/}
          {/* displays the Online boolean in text*/}
          {/*<View><Text>Online: {this.props.isOnline.toString()}</Text></View> */}

          {this.state.buttons.drawButtonsVisible ?
            <View style={this.props.isNotebookPanelVisible ||
            (this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE && this.props.deviceDimensions.width > 768)
              ? [styles.drawToolsContainer, {right: deviceWidth()}]
              : styles.drawToolsContainer}>
              <IconButton
                style={{top: 5}}
                source={this.state.mapMode === MapModes.DRAW.POINT ?
                  require('../../assets/icons/PointButton_pressed.png') : require(
                    '../../assets/icons/PointButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POINT)}
              />
              <IconButton
                style={{top: 5}}
                source={this.state.mapMode === MapModes.DRAW.LINE ?
                  require('../../assets/icons/LineButton_pressed.png') : require(
                    '../../assets/icons/LineButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.LINE)}
              />
              <IconButton
                style={{top: 5}}
                source={this.state.mapMode === MapModes.DRAW.POLYGON ?
                  require('../../assets/icons/PolygonButton_pressed.png') :
                  require('../../assets/icons/PolygonButton.png')}
                onPress={this.clickHandler.bind(this, MapModes.DRAW.POLYGON)}
              />
            </View>
            : null}
          {/*</View>*/}
          <View style={styles.settingsIconContainer}>
            <IconButton
              source={require('../../assets/icons/SettingsButton.png')}
              onPress={this.clickHandler.bind(this, "settings")}
            />
          </View>
          <View style={styles.leftsideIcons}>
            <IconButton
              source={require('../../assets/icons/MapActionsButton.png')}
              onPress={() => this.toggleDialog("mapActionsMenuVisible")}
            />
            <IconButton
              source={require('../../assets/icons/SymbolsButton.png')}
              onPress={() => this.toggleDialog("mapSymbolsMenuVisible")}
            />
            <IconButton
              source={require('../../assets/icons/LayersButton.png')}
              onPress={() => this.toggleDialog("baseMapMenuVisible")}
            />
          </View>
          <View style={styles.bottomLeftIcons}>
            <IconButton
              style={{top: 5}}
              source={require('../../assets/icons/MyLocationButton.png')}
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
          {/*{this.props.isAllSpotsPanelVisible ? <Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>*/}
          {/*  <AllSpotsView*/}
          {/*    close={() => this.closeAllSpotsPanel()}*/}
          {/*  />*/}
          {/*</Animated.View> : null}*/}
          <Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>
            <AllSpotsView
              close={() => this.closeAllSpotsPanel()}
            />
          </Animated.View>
          <Modal
            isVisible={this.state.isOfflineMapModalVisible}
            useNativeDriver={true}
          >
            <View style={styles.modal}>
              <SaveMapModal
                close={this.toggleOfflineMapModal}
                map={this.mapViewComponent}
              />
            </View>
          </Modal>
          <Modal
            isVisible={this.props.isImageModalVisible}
            useNativeDriver={true}
            style={{flex: 1}}
          >
            <View style={styles.modal} >
              <Button type={'clear'} titleProps={{color: 'white'}} title="Hide modal" onPress={() => this.toggleImageModal()} />
              <Image
                source={this.props.selectedImage ? {uri: this.getImageSrc(this.props.selectedImage.id)}:
                  {uri: require('../../assets/images/noimage.jpg')}}
                style={{width: wp('90%'), height: hp('90%')  }}
              />
            </View>
          </Modal>
        </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    selectedSpot: state.spot.selectedSpot,
    selectedImage: state.spot.selectedAttributes[0],
    isImageModalVisible: state.home.isImageModalVisible,
    imagePaths: state.images.imagePaths,
    featureCollectionSelected: state.spot.featureCollectionSelected,
    isOnline: state.spot.isOnline,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    isCompassModalVisible: state.notebook.isCompassModalVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    spot: state.spot.features,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible
  }
}

const mapDispatchToProps = {
  setIsOnline: (online) => ({type: spotReducers.SET_ISONLINE, online: online}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
  addPhoto: (imageData) => ({type: imageReducers.ADD_PHOTOS, images: imageData}),
  deleteFeature: (id) => ({type: spotReducers.FEATURE_DELETE, id: id}),
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
  onSpotEditImageObj: (images) => ({type: spotReducers.EDIT_SPOT_IMAGES, images: images}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName})
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
