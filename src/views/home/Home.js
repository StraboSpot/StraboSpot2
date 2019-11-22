import React from 'react';
import {Alert, Animated, Dimensions, Easing, Platform, Text, View} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MapView from '../../components/maps/MapView';
import InitialProjectLoadModal from './ProjectSelectionTypeDialogBox';
import MapActionsDialog from '../../components/dialog-boxes/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from '../../components/dialog-boxes/map-symbols/MapSymbolsDialogBox';
import BaseMapDialog from '../../components/dialog-boxes/base-maps/BaseMapDialogBox';

// <----- Home screen Panels ----->
import NotebookPanel from '../../components/notebook-panel/NotebookPanel';
import SettingsPanel from '../../components/settings-panel/SettingsPanel';
import {MapModes} from '../../components/maps/Map.constants';
import {SettingsMenuItems} from '../../components/settings-panel/SettingsMenu.constants';
import Modal from 'react-native-modal';
import SaveMapModal from '../../components/dialog-boxes/map-actions/SaveMapsModal';
import NotebookPanelMenu from '../../components/notebook-panel/NotebookPanelMenu';
import {connect} from 'react-redux';
import {NotebookPages, notebookReducers} from '../../components/notebook-panel/Notebook.constants';
import {settingPanelReducers} from '../../components/settings-panel/settingsPanel.constants';
import {spotReducers} from '../../spots/Spot.constants';
import {imageReducers} from '../../components/images/Image.constants';
import * as ImageHelper from '../../components/images/Images.container';
import NotebookCompassModal from '../../components/measurements/compass/NotebookCompassModal';
import ShortcutCompassModal from '../../components/measurements/compass/ShortcutCompassModal';
import NotebookSamplesModal from '../../components/samples/NotebookSamplesModal.view';
import ShortcutSamplesModal from '../../components/samples/ShortcutSamplesModal.view';
import {homeReducers, Modals} from './Home.constants';
import notebookStyles from '../../components/notebook-panel/NotebookPanel.styles';
// import Orientation from "react-native-orientation-locker";
import {Directions, FlingGestureHandler, State} from 'react-native-gesture-handler';
import LoadingSpinner from '../../shared/ui/Loading';
import ToastPopup from '../../shared/ui/Toast';
import {Button, Image} from 'react-native-elements';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import styles from './Styles';
import vectorIcon from 'react-native-vector-icons/Ionicons';
import IconButton from '../../shared/ui/IconButton';
import VertexDrag from '../../components/maps/VertexDrag';
import {animatePanels, isEmpty} from '../../shared/Helpers';

// eslint-disable-next-line no-unused-vars
const {height, width} = Dimensions.get('window');
const getWidthPercent = () => {
  if (width < 500) return wp('95%');
  if (width >= 500 && width <= 1000) return wp('50%');
  if (width > 1000) return wp('40%');
};

// const imageOptions = {
//   storageOptions: {
//     skipBackup: true,
//     // path: 'StraboSpot/Images',
//     takePhotoButtonTitle: 'Take Photo Buddy!',
//     chooseFromLibraryButtonTitle: 'choose photo from library'
//   }
// };

class Home extends React.Component {
  _isMounted = false;
  dimensions = Dimensions.get('window');
  online = require('../../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_connected.png');
  offline = require('../../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_offline.png');

  constructor(props) {
    super(props);
    this.state = {
      dialogs: {
        mapActionsMenuVisible: false,
        mapSymbolsMenuVisible: false,
        baseMapMenuVisible: false,
        notebookPanelMenuVisible: false,
      },
      buttons: {
        endDrawButtonVisible: false,
        drawButtonOn: undefined,
        drawButtonsVisible: true,
        editButtonsVisible: false,
      },
      mapMode: MapModes.VIEW,
      settingsMenuVisible: SettingsMenuItems.SETTINGS_MAIN,
      // drawerVisible: false,
      isOfflineMapModalVisible: false,
      isProjectLoadSelectionModalVisible: false,
      currentSpot: undefined,
      allPhotosSaved: [],
      // isAllSpotsPanelVisible: false,
      animation: new Animated.Value(getWidthPercent()),
      settingsPanelAnimation: new Animated.Value(-getWidthPercent()),
      leftsideIconAnimation: new Animated.Value(0),
      rightsideIconAnimation: new Animated.Value(0),
      allSpotsViewAnimation: new Animated.Value(125),
      loading: false,
      toastVisible: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    vectorIcon.getImageSource('pin', 30);
    NetInfo.addEventListener(state => {
      if (state.isConnected) this.handleConnectivityChange(state.isConnected);
      else Alert.alert('Not Online!', 'Please check your internet source.');
    });
    // this.props.setDeviceDims(this.dimensions);
    // if (this.props.deviceDimensions.width < 500) {
    //   Orientation.unlockAllOrientations();
    // }
    // else Orientation.lockToLandscapeLeft();
    Dimensions.addEventListener('change', this.deviceOrientation);
    this.props.setNotebookPanelVisible(false);
    this.props.setAllSpotsPanelVisible(false);
    this.props.setModalVisible(null);
    this.props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
    this.checkForOpenProject();
  }

  componentWillUnmount() {
    this._isMounted = false;
    Dimensions.removeEventListener('change', this.deviceOrientation);
    console.log('All listeners removed');
  }

  deviceOrientation = () => {
    const dimensions = Dimensions.get('window');
    this.props.setDeviceDims(dimensions);
    console.log(this.props.deviceDimensions);
  };

  checkForOpenProject = () => {
    if (isEmpty(this.props.getCurrentProject)) {
      this.setState(prevState => {
        return {
          ...prevState,
          isProjectLoadSelectionModalVisible: true,
        };
      }, () => console.log('Project Select Modal is:', this.state.isProjectLoadSelectionModalVisible));
    }
  };

  cancelEdits = async () => {
    await this.mapViewComponent.cancelEdits();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('editButtonsVisible', false);
    this.toggleButton('drawButtonsVisible', true);
  };

  clickHandler = (name, position) => {
    switch (name) {
      case 'startProject':
        this.startProject();
        break;
      case 'loadProject':
        this.getProjectFromServer();
        break;
      case 'search':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'measurement':
        this.props.setModalVisible(Modals.SHORTCUT_MODALS.COMPASS);
        break;
      case 'sample':
        this.props.setModalVisible(Modals.SHORTCUT_MODALS.SAMPLE);
        break;
      case 'note':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'photo':
        // this.takePicture();
        Alert.alert('Still in the works', `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'sketch':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      // case "notebook":
      //   console.log(`${name}`, " was clicked");
      //   break;
      case 'home':
        this.openHomeDrawer();
        break;

      // Notebook Panel three-dot menu
      case 'closeNotebook':
        this.closeNotebookPanel();
        break;
      case 'copyFeature':
        console.log('Spot Copied!');
        break;
      case 'deleteFeature':
        console.log('Feature Deleted!', this.props.selectedSpot.properties.id);
        this.deleteSelectedFeature(this.props.selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (position === 'open') this.props.setAllSpotsPanelVisible(true);
        else if (position === 'close') this.props.setAllSpotsPanelVisible(false);
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        this.setDraw(name);
        break;
      case 'endDraw':
        this.endDraw();
        break;
      case 'cancelEdits':
        this.cancelEdits();
        break;
      case 'saveEdits':
        this.saveEdits();
        break;
      case 'currentLocation':
        this.goToCurrentLocation();
        break;

      // Map Actions
      case 'zoom':
        console.log(`${name}`, ' was clicked');
        break;
      case 'saveMap':
        this.toggleOfflineMapModal();
        break;
      case 'addTag':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} button in the  will be functioning soon!`);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        break;

      // Map Basemap Layers
      case 'mapboxSatellite':
        this.newBasemapDisplay(name);
        break;
      case 'mapboxOutdoors':
        this.newBasemapDisplay(name);
        break;
      case 'osm':
        this.newBasemapDisplay(name);
        break;
      case 'macrostrat':
        this.newBasemapDisplay(name);
        break;
      case 'custom':
        this.newBasemapDisplay(name);
        break;
    }
  };

  goToCurrentLocation = async () => {
    this.toggleLoading(true);
    try {
      await this.mapViewComponent.setCurrentLocation();
      this.toggleLoading(false);
      await this.mapViewComponent.goToCurrentLocation();
    }
    catch {
      this.toggleLoading(false);
      Alert.alert('Geolocation Error', 'Error getting current location.');
    }
  };

  flingHandlerSettingsPanel = ({nativeEvent}) => {
    if (this._isMounted) {
      if (this.props.homePanelVisible) {
        if (nativeEvent.oldState === State.ACTIVE) {
          console.log('FLING TO CLOSE Settings Panel!', nativeEvent);
          animatePanels(this.state.settingsPanelAnimation, -getWidthPercent());
          this.props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
          this.props.setHomePanelVisible(false);
          animatePanels(this.state.leftsideIconAnimation, 0);
        }
      }
      else this.props.setHomePanelVisible(true);
    }
  };

  flingHandlerNotebook = ({nativeEvent}) => {
    if (this._isMounted) {
      if (nativeEvent.oldState === State.ACTIVE) {
        console.log('FLING TO CLOSE NOTEBOOK!', nativeEvent);
        animatePanels(this.state.animation, getWidthPercent());
        animatePanels(this.state.rightsideIconAnimation, 0);
        this.props.setNotebookPanelVisible(false);
        this.props.setAllSpotsPanelVisible(false);
      }
    }
  };

  closeNotebookPanel = () => {
    if (this._isMounted) {
      console.log('closing notebook');
      animatePanels(this.state.animation, getWidthPercent());
      animatePanels(this.state.rightsideIconAnimation, 0);
      this.props.setNotebookPanelVisible(false);
      this.props.setAllSpotsPanelVisible(false);
    }
  };

  deleteSelectedFeature = id => {
    const featureName = this.props.selectedSpot.properties.name;
    Alert.alert(
      'Delete Feature?',
      `Are you sure you want to delete feature: \n ${featureName}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            this.props.deleteFeature(id);
            this.closeNotebookPanel();
          },
        },
      ],
    );
  };

  dialogClickHandler = (dialog, name, position) => {
    this.clickHandler(name, position);
    this.toggleDialog(dialog);
  };

  endDraw = async () => {
    this.mapViewComponent.endDraw();
    this.setMapMode(MapModes.VIEW);
    this.toggleButton('endDrawButtonVisible');
    this.openNotebookPanel();
    this.props.setModalVisible(null);
  };

  getImageSrc = id => {
    return this.props.imagePaths[id];
  };

  getSpotFromId = spotId => {
    const spot = this.props.spot.find(spot => {
      return spot.properties.id === spotId;
    });
    // console.log('Aaaaaaaa', spot);
    this.props.onFeatureSelected(spot);
    this.openNotebookPanel();
  };

  //function for online/offline state change event handler
  handleConnectivityChange = isConnected => {
    this.props.setIsOnline(isConnected);
  };

  getProjectFromServer = async () => {
    this.props.setHomePanelVisible(true);
    this.props.setHomePanelPageVisible(SettingsMenuItems.PROJECT.SWITCH_PROJECT);
    this.openHomeDrawer();
    this.setState(prevState => {
      return {
        ...prevState,
        isProjectLoadSelectionModalVisible: false,
      };
    });
  };

  mapPress = () => {
    return this.mapViewComponent.getCurrentBasemap();
  };

  newBasemapDisplay = name => {
    this.mapViewComponent.changeMap(name);
  };

  notebookClickHandler = name => {
    switch (name) {
      case 'menu':
        this.toggleDialog('notebookPanelMenuVisible');
        break;
      case 'export':
        console.log('Export button was pressed');
        break;
      case 'camera':
        this.launchCameraFromNotebook();
        break;
    }
  };

  openHomeDrawer = () => {
    if (this._isMounted) {
      this.props.setHomePanelVisible(true);
      animatePanels(this.state.settingsPanelAnimation, 0);
      animatePanels(this.state.leftsideIconAnimation, wp('30%'));
    }
  };

  openNotebookPanel = pageView => {
    if (this._isMounted) {
      console.log('notebook opening', pageView);
      this.props.setNotebookPageVisible(pageView);
      animatePanels(this.state.animation, wp('0%'));
      animatePanels(this.state.rightsideIconAnimation, wp('-35%'));
      this.props.setNotebookPanelVisible(true);
    }
  };

  launchCameraFromNotebook = async () => {
    let imageArr = this.state.allPhotosSaved;
    try {
      const savedPhoto = await ImageHelper.takePicture();
      this.toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (this.state.allPhotosSaved.length > 0) {
          console.log('ALL PHOTOS SAVED', this.state.allPhotosSaved);
          this.props.addPhoto(imageArr);
          this.props.onSpotEditImageObj(imageArr);
          this.toggleLoading();
          // this.toggleToast();
        }
        else {
          this.toggleLoading(false);
          Alert.alert('No Photos To Save', 'please try again...');
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
              width: savedPhoto.width,
            }],
          };
        }, () => {
          console.log('Photos Saved:', this.state.allPhotosSaved);
          this.launchCameraFromNotebook();
        });
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!');
    }
  };

  samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected');
  };

  renderLoadProjectFromModal = () => {
    return (
      <InitialProjectLoadModal
        visible={this.state.isProjectLoadSelectionModalVisible}
        onPress={type => this.clickHandler(type)}
        children={undefined}
      />
    );
  };

  setDraw = async mapMode => {
    this.mapViewComponent.cancelDraw();
    if (this.state.mapMode === MapModes.VIEW && mapMode !== MapModes.DRAW.POINT) {
      this.toggleButton('endDrawButtonVisible', true);
    }
    else if (this.state.mapMode === mapMode) mapMode = MapModes.VIEW;
    await this.setMapMode(mapMode);
    if (this.state.mapMode === MapModes.DRAW.POINT) {
      this.toggleLoading(true);
      try {
        await this.mapViewComponent.setPointAtCurrentLocation();
        this.toggleLoading(false);
        await this.setMapMode(MapModes.VIEW);
        // this.openNotebookPanel();
        this.props.setNotebookPanelVisible(true);
        this.props.setNotebookPageVisible(NotebookPages.OVERVIEW);
        Animated.timing(this.state.animation, {
          toValue: wp('0%'),
          duration: 350,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
      catch (err) {
        this.toggleLoading(false);
        Alert.alert('Geolocation Error', 'Error getting current location. Set a point manually.');
        this.toggleButton('endDrawButtonVisible', true);
      }
    }
    if (mapMode === MapModes.VIEW) {
      this.toggleButton('endDrawButtonVisible', false);
    }
  };

  setMapMode = async (mapMode) => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          mapMode: mapMode,
        };
      }, () => console.log('Map Mode set to:', mapMode));
    }
    else console.log('Attempting to set the state for the map mode but Home Component not mounted.');
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

  startProject = () => {
    console.log('Starting Project...');
    this.setState(prevState => {
      return {
        ...prevState,
        isProjectLoadSelectionModalVisible: false,
      };
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
            [button]: isVisible ? isVisible : !prevState.buttons[button],
          },
        };
      });
    }
    else console.log('Attempting to toggle', button, 'but Home Component not mounted.');
  };

  // Toggle given dialog between true (visible) and false (hidden)
  toggleDialog = dialog => {
    console.log('Toggle', dialog);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          dialogs: {
            ...prevState.dialogs,
            [dialog]: !prevState.dialogs[dialog],
          },
        };
      }, () => console.log(dialog, 'is set to', this.state.dialogs[dialog]));
    }
    else console.log('Attempting to toggle', dialog, 'but Home Component not mounted.');
  };

  toggleImageModal = () => {
    if (this._isMounted) {
      this.props.setIsImageModalVisible(!this.props.isImageModalVisible);
    }
  };

  toggleLoading = bool => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          loading: bool,
        };
      }, () => console.log('Loading', this.state.loading));
    }
  };

  toggleOfflineMapModal = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          isOfflineMapModalVisible: !prevState.isOfflineMapModalVisible,
        };
      }, () => console.log('Modal state', this.state.isOfflineMapModalVisible));
    }
  };

  toggleSwitch = switchName => {
    console.log('Switch', switchName);
    if (this._isMounted) {
      this.props.onShortcutSwitchChange(switchName);
      console.log(this.props.shortcutSwitchPosition);
    }
  };

  toggleToast = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          toastVisible: !prevState.toastVisible,
        };
      }, () => console.log('Toast state', this.state.toastVisible));
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

  onToastShow = () => {
    this.toggleLoading(false);
    setTimeout(() => {
      this.toggleToast();
      this.setState(prevState => {
        return {
          ...prevState,
          allPhotosSaved: [],
        };
      });
    }, 2000);
  };

  render() {
    const animateNotebookMenu = {transform: [{translateX: this.state.animation}]};
    const animateSettingsPanel = {transform: [{translateX: this.state.settingsPanelAnimation}]};
    const leftsideIconAnimation = {transform: [{translateX: this.state.leftsideIconAnimation}]};
    const rightsideIconAnimation = {transform: [{translateX: this.state.rightsideIconAnimation}]};
    let compassModal = null;
    let samplesModal = null;

    const homeDrawer =
      <FlingGestureHandler
        direction={Directions.LEFT}
        numberOfPointers={1}
        // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
        onHandlerStateChange={(ev) => this.flingHandlerSettingsPanel(ev)}
      >
        <Animated.View style={[styles.settingsDrawer, animateSettingsPanel]}>
          <SettingsPanel openNotebookPanel={(pageView) => this.openNotebookPanel(pageView)}/>
        </Animated.View>
      </FlingGestureHandler>;

    const notebookPanel =
      <FlingGestureHandler
        direction={Directions.RIGHT}
        numberOfPointers={1}
        // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
        onHandlerStateChange={ev => this.flingHandlerNotebook(ev)}>
        <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
          <NotebookPanel
            onHandlerStateChange={(ev, name) => this.flingHandlerNotebook(ev, name)}
            closeNotebook={this.closeNotebookPanel}
            textStyle={{fontWeight: 'bold', fontSize: 12}}
            onPress={name => this.notebookClickHandler(name)}>
            {/*<AllSpotsView/>*/}
          </NotebookPanel>
        </Animated.View>
      </FlingGestureHandler>;

    // Renders Compass modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS && this.props.isNotebookPanelVisible) {
      compassModal =
        <NotebookCompassModal
          close={() => this.props.setModalVisible(null)}
          onPress={page => this.modalHandler(page, Modals.SHORTCUT_MODALS.COMPASS)}
        />;
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      compassModal =
        <ShortcutCompassModal
          close={() => this.props.setModalVisible(null)}
          onPress={page => this.modalHandler(page, Modals.NOTEBOOK_MODALS.COMPASS)}
        />;
    }

    // Renders samples modals in either shortcut or notebook view
    if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE && this.props.isNotebookPanelVisible) {
      samplesModal =
        <NotebookSamplesModal
          close={() => this.props.setModalVisible(null)}
          cancel={() => this.samplesModalCancel()}
          onPress={(page) => this.modalHandler(page, Modals.SHORTCUT_MODALS.SAMPLE)}
        />;
    }
    else if (this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      samplesModal =
        <ShortcutSamplesModal
          close={() => this.props.setModalVisible(null)}
          cancel={() => this.samplesModalCancel()}
          onPress={(page) => this.modalHandler(page, Modals.NOTEBOOK_MODALS.SAMPLE)}
        />;
    }

    return (
      <View style={styles.container}>
        {/*{this.props.isNotebookPanelVisible && notebookPanel}*/}
        <MapView
          onRef={ref => (this.mapViewComponent = ref)}
          mapMode={this.state.mapMode}
          startEdit={this.startEdit}
        />
        {this.props.vertexStartCoords && <VertexDrag/>}
        {this.state.loading && <LoadingSpinner/>}
        {this.state.toastVisible &&
        <ToastPopup
          visible={this.state.toastVisible}
          onShow={() => this.onToastShow()}
        >
          {this.state.allPhotosSaved.length === 1 ?
            <Text>{this.state.allPhotosSaved.length} Picture Saved!</Text> :
            <Text>{this.state.allPhotosSaved.length} Pictures Saved!</Text>}
        </ToastPopup>}
        {Platform.OS === 'ios' &&
        <Animated.View style={leftsideIconAnimation}>
          {(this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

          {(this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
        </Animated.View>}
        {Platform.OS === 'android' &&
        <View>
          {(this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

          {(this.props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
            this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
        </View>}
        <View style={styles.topCenter}>
          {this.state.buttons.endDrawButtonVisible ?
            <Button
              containerStyle={{alignContent: 'center'}}
              buttonStyle={styles.drawToolsButtons}
              titleStyle={{color: 'black'}}
              title={'End Draw'}
              onPress={this.clickHandler.bind(this, 'endDraw')}
            />
            : null}
          {this.state.buttons.editButtonsVisible ?
            <View>
              <Button
                buttonStyle={styles.drawToolsButtons}
                titleStyle={{color: 'black'}}
                title={'Save Edits'}
                onPress={this.clickHandler.bind(this, 'saveEdits')}
              />
              <Button
                buttonStyle={[styles.drawToolsButtons, {marginTop: 5}]}
                titleStyle={{color: 'black'}}
                title={'Cancel Edits'}
                onPress={this.clickHandler.bind(this, 'cancelEdits')}
              />
            </View>
            : null}
        </View>
        <Animated.View style={[styles.onlineStatus, rightsideIconAnimation]}>
          <IconButton
            source={this.props.isOnline ? this.online : this.offline}
            // onPress={this.clickHandler.bind(this, "search")}
          />
        </Animated.View>
        <Animated.View style={[styles.rightsideIcons, rightsideIconAnimation]}>
          {this.props.shortcutSwitchPosition.Tag ?
            <IconButton
              source={require('../../assets/icons/StraboIcons_Oct2019/TagButton.png')}
              onPress={this.clickHandler.bind(this, 'tag')}
            /> : null}
          {this.props.shortcutSwitchPosition.Measurement ?
            <IconButton
              source={this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? require(
                '../../assets/icons/StraboIcons_Oct2019/MeasurementButton_pressed.png')
                : require('../../assets/icons/StraboIcons_Oct2019/MeasurementButton.png')}
              onPress={this.clickHandler.bind(this, 'measurement')}
            /> : null}
          {this.props.shortcutSwitchPosition.Sample ?
            <IconButton
              source={this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? require(
                '../../assets/icons/StraboIcons_Oct2019/SampleButton_pressed.png')
                : require('../../assets/icons/StraboIcons_Oct2019/SampleButton.png')}
              onPress={this.clickHandler.bind(this, 'sample')}
            /> : null}
          {this.props.shortcutSwitchPosition.Note ?
            <IconButton
              name={'Note'}
              source={require('../../assets/icons/StraboIcons_Oct2019/NoteButton.png')}
              onPress={this.clickHandler.bind(this, 'note')}
            /> : null}
          {this.props.shortcutSwitchPosition.Photo ?
            <IconButton
              source={require('../../assets/icons/StraboIcons_Oct2019/PhotoButton.png')}
              onPress={this.clickHandler.bind(this, 'photo')}
            /> : null}
          {this.props.shortcutSwitchPosition.Sketch ?
            <IconButton
              source={require('../../assets/icons/StraboIcons_Oct2019/SketchButton.png')}
              onPress={this.clickHandler.bind(this, 'sketch')}
            /> : null}
        </Animated.View>
        <View style={styles.notebookViewIcon}>
          {this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ||
          this.props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? null : <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/NotebookViewButton.png')}
            onPress={() => this.openNotebookPanel()}
          />}
        </View>
        {/*<View style={this.props.isNotebookPanelVisible ? styles.bottomRightIconsShortcutModal*/}
        {/*: styles.bottomRightIcons}>*/}
        {/* displays the Online boolean in text*/}
        {/*<View><Text>Online: {this.props.isOnline.toString()}</Text></View> */}

        {this.state.buttons.drawButtonsVisible ?
          <Animated.View style={[styles.drawToolsContainer, rightsideIconAnimation]}>
            <IconButton
              style={{top: 5}}
              source={this.state.mapMode === MapModes.DRAW.POINT ?
                require('../../assets/icons/StraboIcons_Oct2019/PointButton_pressed.png') : require(
                  '../../assets/icons/StraboIcons_Oct2019/PointButton.png')}
              onPress={this.clickHandler.bind(this, MapModes.DRAW.POINT)}
            />
            <IconButton
              style={{top: 5}}
              source={this.state.mapMode === MapModes.DRAW.LINE ?
                require('../../assets/icons/StraboIcons_Oct2019/LineButton_pressed.png') : require(
                  '../../assets/icons/StraboIcons_Oct2019/LineButton.png')}
              onPress={this.clickHandler.bind(this, MapModes.DRAW.LINE)}
            />
            <IconButton
              style={{top: 5}}
              source={this.state.mapMode === MapModes.DRAW.POLYGON ?
                require('../../assets/icons/StraboIcons_Oct2019/PolygonButton_pressed.png') :
                require('../../assets/icons/StraboIcons_Oct2019/PolygonButton.png')}
              onPress={this.clickHandler.bind(this, MapModes.DRAW.POLYGON)}
            />
          </Animated.View>
          : null}
        {/*</View>*/}
        <View style={styles.homeIconContainer}>
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/HomeButton.png')}
            onPress={this.clickHandler.bind(this, 'home')}
          />
        </View>
        <Animated.View style={[styles.leftsideIcons, leftsideIconAnimation]}>
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/MapActionsButton.png')}
            onPress={() => this.toggleDialog('mapActionsMenuVisible')}
          />
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/SymbolsButton.png')}
            onPress={() => this.toggleDialog('mapSymbolsMenuVisible')}
          />
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/layersButton.png')}
            onPress={() => this.toggleDialog('baseMapMenuVisible')}
          />
        </Animated.View>
        <Animated.View style={[styles.bottomLeftIcons, leftsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={require('../../assets/icons/StraboIcons_Oct2019/MyLocationButton.png')}
            onPress={this.clickHandler.bind(this, 'currentLocation')}
          />
        </Animated.View>
        <MapActionsDialog
          visible={this.state.dialogs.mapActionsMenuVisible}
          onPress={(name) => this.dialogClickHandler('mapActionsMenuVisible', name)}
          onTouchOutside={() => this.toggleDialog('mapActionsMenuVisible')}
        />
        <MapSymbolsDialog
          visible={this.state.dialogs.mapSymbolsMenuVisible}
          onPress={(name) => this.dialogClickHandler('mapSymbolsMenuVisible', name)}
          onTouchOutside={() => this.toggleDialog('mapSymbolsMenuVisible')}
        />
        <BaseMapDialog
          visible={this.state.dialogs.baseMapMenuVisible}
          onPress={(name) => this.dialogClickHandler('baseMapMenuVisible', name)}
          onTouchOutside={() => this.toggleDialog('baseMapMenuVisible')}
        />
        <NotebookPanelMenu
          visible={this.state.dialogs.notebookPanelMenuVisible}
          onPress={(name, position) => this.dialogClickHandler('notebookPanelMenuVisible', name, position)}
          onTouchOutside={() => this.toggleDialog('notebookPanelMenuVisible')}
        />
        {/*{this.props.isAllSpotsPanelVisible ? <Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>*/}
        {/*  <AllSpotsView*/}
        {/*    close={() => this.closeAllSpotsPanel()}*/}
        {/*  />*/}
        {/*</Animated.View> : null}*/}
        {/*<Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>*/}
        {/*  <AllSpotsView*/}
        {/*    close={() => this.closeAllSpotsPanel()}*/}
        {/*  />*/}
        {/*</Animated.View>*/}
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
          <View style={styles.modal}>
            <Button
              type={'clear'}
              titleProps={{color: 'white'}}
              title='Hide modal'
              onPress={() => this.toggleImageModal()}/>
            <Image
              source={this.props.selectedImage ? {uri: this.getImageSrc(this.props.selectedImage.id)} :
                {uri: require('../../assets/images/noimage.jpg')}}
              style={{width: wp('90%'), height: hp('90%')}}
            />
          </View>
        </Modal>
        {notebookPanel}
        {homeDrawer}
        {this.renderLoadProjectFromModal()}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedSpot: state.spot.selectedSpot,
    selectedImage: state.spot.selectedAttributes[0],
    isImageModalVisible: state.home.isImageModalVisible,
    imagePaths: state.images.imagePaths,
    featureCollectionSelected: state.spot.featureCollectionSelected,
    isOnline: state.home.isOnline,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    isCompassModalVisible: state.notebook.isCompassModalVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    spot: state.spot.features,
    getCurrentProject: state.project.project,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    vertexStartCoords: state.map.vertexStartCoords,
    userData: state.user.userData,
    homePageVisible: state.settingsPanel.settingsPageVisible,
    homePanelVisible: state.home.isSettingsPanelVisible,
  };
}

const mapDispatchToProps = {
  setIsOnline: (online) => ({type: homeReducers.SET_ISONLINE, online: online}),
  setHomePanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setHomePanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setSettingsPanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
  addPhoto: (imageData) => ({type: imageReducers.ADD_PHOTOS, images: imageData}),
  deleteFeature: (id) => ({type: spotReducers.FEATURE_DELETE, id: id}),
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
  onSpotEditImageObj: (images) => ({type: spotReducers.EDIT_SPOT_IMAGES, images: images}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
