import React from 'react'
import {Animated, Alert, Text, View, Button, Dimensions, Platform} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import ImagePicker from 'react-native-image-picker';
import styles from './Styles';
import {goToAuth, goSignIn, goToSpotPage, goToImageGallery} from '../../routes/Navigation'
import {Navigation} from 'react-native-navigation';
import MapView from '../../components/maps/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from '../../shared/Icons';
import IconButton from '../../shared/ui/IconButton';
import MapActionsDialog from '../../components/modals/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from "../../components/modals/map-symbols/MapSymbolsDialogBox";
import BaseMapDialog from "../../components/modals/base-maps/BaseMapDialogBox";
import NotebookPanel from '../../components/notebook-panel/NotebookPanel';
import Drawer from 'react-native-drawer';
import SettingsPanel from '../../components/settings-panel/SettingsPanel';
import {MapModes} from '../../components/maps/Map.constants';
import ShortcutMenu from '../../components/settings-panel/shortcuts-menu/ShortcutsMenu';
import ManageOfflineMapsMenu from '../../components/settings-panel/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu';
import CustomMapsMenu from '../../components/settings-panel/Custom-Maps-Menu/CustomMapsMenu';
import ButtonWithBackground from '../../shared/ui/ButtonWithBackground';
import Modal from "react-native-modal";
import SaveMapModal from '../../components/modals/map-actions/SaveMapsModal';
import NotebookPanelMenu from '../../components/notebook-panel/NotebookPanelMenu';
import {connect} from 'react-redux';
import {notebookReducers, NotebookPages} from "../../components/notebook-panel/Notebook.constants";
import {spotReducers} from "../../spots/Spot.constants";
import {imageReducers} from "../../components/images/Image.constants";
import {saveFile} from '../../services/images/ImageDownload';
import {takePicture} from '../../components/images/Images.container';
import NotebookCompassModal from "../../components/compass/NotebookCompassModal";
import ShortcutCompassModal from '../../components/compass/ShortcutCompassModal';
import NotebookSamplesModal from '../../components/samples/NotebookSamplesModal.view';
import ShortcutSamplesModal from '../../components/samples/ShortcutSamplesModal.view';
import AllSpotsView from '../../components/notebook-panel/AllSpots.view';
import {homeReducers, Modals} from "./Home.constants";
import sampleStyles from '../../components/samples/samples.style';
import notebookStyles from '../../components/notebook-panel/NotebookPanel.styles';

const platformType = Platform.OS === 'ios' ? 'window' : 'screen';
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
      settingsMenuVisible: 'settingsMain',
      drawerVisible: false,
      isOfflineMapModalVisible: false,
      currentSpot: undefined,
      allPhotosSaved: [],
      isAllSpotsPanelVisible: false,
      animation: new Animated.Value(400),
      allSpotsViewAnimation: new Animated.Value(125)
    };
  }

  componentDidMount() {
    this._isMounted = true;
    Icon.getImageSource("pin", 30);
    Orientation.lockToLandscapeLeft();
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    this.props.setDeviceDims(this.dimensions);
    Dimensions.addEventListener('change', this.deviceOrientation);
    // this.props.setNotebookPanelVisible(false);
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
        this.closeNotebookPanel();
        break;
      case 'copyFeature':
        console.log('Spot Copied!');
        break;
      case 'deleteFeature':
        console.log('Feature Deleted!', this.props.selectedSpot.properties.id);
        this.deleteSelectedFeature(this.props.selectedSpot.properties.id);
        break;
      case 'showAllSpotsPanel':
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
    // Animated.timing(this.state.allSpotsViewAnimation, {
    //   toValue: 125,
    //   duration: 350,
    //   useNativeDriver: true
    // }).start();
    this.setState(prevState => {
      return {
        ...prevState,
        isAllSpotsPanelVisible: false
      }
    })
  };

  closeNotebookPanel = () => {
    if (this._isMounted) {
      this.props.setNotebookPanelVisible(false);
      this.props.setModalVisible(null);
      // if (this.state.isAllSpotsPanelVisible) {
      //   this.closeAllSpotsPanel();
      // }
      // this.doAnimation();
      // Animated.timing(this.state.animation, {
      //   toValue: 400,
      //   duration: 350,
      //   easing: Easing.linear,
      //   useNativeDriver: true
      // }).start();
      this.setState(prevState => {
        return {
          ...prevState,
          isAllSpotsPanelVisible: false
        }
      });
    }
  };

  closeSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.close();
    this.setVisibleMenuState('settingsMain');
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

  doAnimation = () => {
    // let toValue = 400;
    let toValue = 400;
    if (!this.props.isNotebookPanelVisible) {
      toValue = 0;
    }
    Animated.timing(this.state.animation, {
      toValue: toValue,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  endDraw = async () => {
    this.mapViewComponent.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
    // this.doAnimation();
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

  openAllSpotsPanel = () => {
    // this.props.setNotebookPanelVisible(false);
    // Animated.spring(this.state.allSpotsViewAnimation, {
    //   toValue: 0,
    //   // speed: 3,
    //   bounciness: 2,
    //   useNativeDriver: true
    // }).start();
    this.setState(prevState => {
      return {
        ...prevState,
        isAllSpotsPanelVisible: true
      }
    })
  };

  openSettingsDrawer = () => {
    this.toggleDrawer();
    this.drawer.open();
  };

  openNotebookPanel = () => {
    if (this._isMounted) {
      this.props.setNotebookPanelVisible(true);
      // this.doAnimation();
      // Animated.timing(this.state.animation, {
      //   toValue: 0,
      //   duration: 350,
      //   // easing: Easing.linear,
      //   useNativeDriver: true
      // }).start();
      this.props.setNotebookPageVisible(NotebookPages.OVERVIEW);
      // this.setState(prevState => {
      //   return {
      //     ...prevState,
      //     isSamplesModalVisible: false
      //   }
      // });
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
      case 'Custom Maps':
        this.setVisibleMenuState('Custom Maps');
        break;
      case 'Image Gallery':
        goToImageGallery();
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
    ImagePicker.launchCamera(imageOptions, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        await this.props.addPhoto(this.state.allPhotosSaved);
        alert('Photos Saved!')
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

  render() {
    const spot = this.props.selectedSpot;
    const isOnline = this.props.isOnline;
    const animateNotebookMenu = {
      transform: [
        {translateX: this.state.animation}
      ]
    };
    const animateAllSpotsMenu = {
      transform: [
        {translateX: this.state.allSpotsViewAnimation}
      ]
    };
    let content = null;
    let compassModal = null;
    let samplesModal = null;
    let notebookPanel = null;

    if (this.state.isAllSpotsPanelVisible) {
      notebookPanel =
        <View style={[notebookStyles.panel,]}>
          <NotebookPanel
            style={{right: 125}}
            closeNotebook={this.closeNotebookPanel}
            textStyle={{fontWeight: 'bold', fontSize: 12}}
            onPress={(name) => this.notebookClickHandler(name)}
          />
        </View>
    }
    else {
      notebookPanel =
        <View style={[notebookStyles.panel,]}>
          <NotebookPanel
            closeNotebook={this.closeNotebookPanel}
            textStyle={{fontWeight: 'bold', fontSize: 12}}
            onPress={(name) => this.notebookClickHandler(name)}
          />
        </View>
    }

    // Renders Compass modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
      compassModal =
        <NotebookCompassModal
          close={() => this.props.setModalVisible(null)}
        />;
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      compassModal =
        <ShortcutCompassModal
          close={() => this.props.setModalVisible(null)}
        />;
    }

    // Renders Samples modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE) {
      const dimensions = this.props.deviceDimensions;
      console.log('This.props.deviceDimensions', dimensions);
      samplesModal = (
        <NotebookSamplesModal
          close={() => this.props.setModalVisible(null)}
          cancel={() => this.samplesModalCancel()}
        />
      )
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      const dimensions = this.props.deviceDimensions;
      console.log('This.props.deviceDimensions', dimensions);
      samplesModal =
        <View
          style={sampleStyles.modalPositionShortcutView}>
          <ShortcutSamplesModal
            close={() => this.props.setModalVisible(null)}
            cancel={() => this.samplesModalCancel()}
            style={{justifyContent: 'center'}}
          />
        </View>
    }

    if (this.state.settingsMenuVisible === 'settingsMain') {
      content = <SettingsPanel onPress={(name) => this.settingsClickHandler(name)}/>
    }
    else if (this.state.settingsMenuVisible === 'Shortcut Menu') {
      content =
        <ShortcutMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
          shortcutSwitchPosition={this.props.shortcutSwitchPosition}
        />
    }
    else if (this.state.settingsMenuVisible === 'Manage Offline Maps') {
      content =
        <ManageOfflineMapsMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
          closeSettingsDrawer={() => this.closeSettingsDrawer()}
        />
    }
    else if (this.state.settingsMenuVisible === 'Custom Maps') {
      content =
        <CustomMapsMenu
          onPress={() => this.setVisibleMenuState('settingsMain')}
          toggleSwitch={(switchName) => this.toggleSwitch(switchName)}
          closeSettingsDrawer={() => this.closeSettingsDrawer()}
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
                   startEdit={this.startEdit}
          />
          {this.props.isNotebookPanelVisible && notebookPanel}
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
            <View style={this.props.isNotebookPanelVisible ? [styles.drawToolsContainer, {right: 410}]
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
          {this.state.isAllSpotsPanelVisible ? <View style={[notebookStyles.allSpotsPanel,]}>
            <AllSpotsView
              close={() => this.closeAllSpotsPanel()}
            />
          </View> : null}
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
        </View>
      </Drawer>
    )
  }
}

function mapStateToProps(state) {
  return {
    selectedSpot: state.spot.selectedSpot,
    featureCollectionSelected: state.spot.featureCollectionSelected,
    isOnline: state.spot.isOnline,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    isCompassModalVisible: state.notebook.isCompassModalVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    spot: state.spot.features,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition
    // visiblePage: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {
  setIsOnline: (online) => ({type: spotReducers.SET_ISONLINE, online: online}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
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
