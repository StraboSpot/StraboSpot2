import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, Platform, Text, View} from 'react-native';

import * as Sentry from '@sentry/react-native';
import * as turf from '@turf/turf';
import {Button, Image} from 'react-native-elements';
import {BallIndicator} from 'react-native-indicators';
import Modal from 'react-native-modal';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {connect, useDispatch, useSelector} from 'react-redux';

import sharedDialogStyles from '../../shared/common.styles';
import {animatePanels, isEmpty} from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import Map from '../maps/Map';
import {MapModes, mapReducers} from '../maps/maps.constants';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapsHook from '../maps/useMaps';
import VertexDrag from '../maps/VertexDrag';
import NotebookCompassModal from '../measurements/compass/NotebookCompassModal';
import ShortcutCompassModal from '../measurements/compass/ShortcutCompassModal';
import AllSpotsPanel from '../notebook-panel/AllSpots';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import InitialProjectLoadModal from '../project/InitialProjectLoadModal';
import ProjectDescription from '../project/ProjectDescription';
import useProjectHook from '../project/useProject';
import NotebookSamplesModal from '../samples/NotebookSamplesModal';
import ShortcutSamplesModal from '../samples/ShortcutSamplesModal';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import {
  TagsNotebookModal,
  TagAddRemoveSpots,
  TagDetailSidePanel,
  TagsShortcutModal,
  AddTagsToSpotsShortcutModal,
} from '../tags';
import {Modals} from './home.constants';
import {
  gotDeviceDimensions,
  setAllSpotsPanelVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setModalVisible,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setOfflineMapsModalVisible,
  setMainMenuPanelVisible,
  setStatusMessagesModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';

const homeMenuPanelWidth = 300;
const notebookPanelWidth = 400;
const mainMenuSidePanelWidth = 300;

const Home = (props) => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceWidth = Dimensions.get(platform).width;
  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const customMaps = useSelector(state => state.map.customMaps);
  const deviceDimensions = useSelector(state => state.home.deviceDimensions);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const isAllSpotsPanelVisible = useSelector(state => state.home.isAllSpotsPanelVisible);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isImageModalVisible = useSelector(state => state.home.isImageModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isSidePanelVisible = useSelector(state => state.mainMenu.isSidePanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const sidePanelView = useSelector(state => state.mainMenu.sidePanelView);
  const user = useSelector(state => state.user);

  // const imagesCount = useSelector(state => state.home.imageProgress.imagesDownloadedCount);
  // const imagesNeeded = useSelector(state => state.home.imageProgress.neededImageIds);
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    endDrawButtonVisible: false,
    drawButtonOn: undefined,
    drawButtonsVisible: true,
    editButtonsVisible: false,
    userLocationButtonOn: false,
  });
  const [mapMode, setMapMode] = useState(MapModes.VIEW);
  // const [isProjectLoadSelectionModalVisible, setIsProjectLoadSelectionModalVisible] = useState(false);
  // const [allPhotosSaved, setAllPhotosSaved] = useState([]);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  // const [customMapsSidePanelAnimation] = useState(new Animated.Value(-customMapsSidePanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);

  const mapViewComponent = useRef(null);
  const toastRef = useRef();

  useEffect(() => {
    // props.setDeviceDims(dimensions);
    // if (deviceDimensions.width < 500) {
    //   Orientation.unlockAllOrientations();
    // }
    // else Orientation.lockToLandscapeLeft();
    if (user.email && user.email) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': user.email, username: user.name});
      });
    }
    Dimensions.addEventListener('change', deviceOrientation);
    console.log('Initializing Home page');
    initialize().then((res) => {
      dispatch(setProjectLoadSelectionModalVisible({bool: res}));
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    });
    return function cleanup() {
      Dimensions.removeEventListener('change', deviceOrientation);
    };
  }, [user]);

  useEffect(() => {
    if (props.currentImageBasemap && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap cleanup UE');
    };
  }, [props.currentImageBasemap, customMaps]);

  useEffect(() => {
    if (projectLoadComplete) {
      mapViewComponent.current.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete({bool: false}));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  const cancelEdits = async () => {
    await mapViewComponent.current.cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    // toggleButton('editButtonsVisible', false);
    // toggleButton('drawButtonsVisible', true);
  };

  const initialize = async () => {
    return await useHome.initializeHomePage();
  };

  const clickHandler = (name, value) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.TAGS) {
          dispatch(setModalVisible({modal: null}));
        }
        else modalHandler(null, Modals.SHORTCUT_MODALS.TAGS);
        closeNotebookPanel();
        break;
      case 'measurement':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: Modals.SHORTCUT_MODALS.COMPASS}));
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: Modals.SHORTCUT_MODALS.SAMPLE}));
        closeNotebookPanel();
        break;
      case 'note':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
          dispatch(setModalVisible({modal: null}));
        }
        else dispatch(setModalVisible({modal: Modals.SHORTCUT_MODALS.NOTES}));
        closeNotebookPanel();
        break;
      case 'photo':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        useMaps.setPointAtCurrentLocation().then((point) => {
          console.log('Point', point);
          useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
            imagesSavedLength === 1
              ? toastRef.current.show(`${imagesSavedLength} photo saved in spot: ${point.properties.name}`)
              : (
                toastRef.current.show(`${imagesSavedLength} photos saved in spot: ${props.selectedSpot.properties.name}`)
              );
            openNotebookPanel();
          });
        });
        // toastRef.current.show('I AM A TOAST!!');
        // useImages.takePicture();
        // Alert.alert('Still in the works',
        //   `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'sketch':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      // case "notebook":
      //   console.log(`${name}`, " was clicked");
      //   break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Notebook Panel three-dot menu
      case 'closeNotebook':
        closeNotebookPanel();
        break;
      case 'copySpot':
        useSpots.copySpot();
        dispatch(setNotebookPageVisible(NotebookPages.OVERVIEW));
        break;
      case 'deleteSpot':
        deleteSpot(selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (value === 'open') dispatch(setAllSpotsPanelVisible({bool: true}));
        else if (value === 'close') dispatch(setAllSpotsPanelVisible({bool: false}));
        break;
      case 'zoomToSpot':
        mapViewComponent.current.zoomToSpot();
        break;
      case 'showNesting':
        dispatch(setNotebookPageVisible(NotebookPages.NESTING));
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
      case MapModes.DRAW.FREEHANDPOLYGON:
      case MapModes.DRAW.FREEHANDLINE:
        if (!isEmpty(selectedDataset)) setDraw(name);
        else Alert.alert('No Current Dataset', 'A current dataset needs to be set before drawing Spots.');
        break;
      case 'endDraw':
        endDraw();
        break;
      case 'cancelEdits':
        cancelEdits();
        break;
      case 'saveEdits':
        saveEdits();
        break;
      case 'toggleUserLocation':
        if (!value) goToCurrentLocation();
        mapViewComponent.current.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        dispatch(({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined}));
        break;
      // Map Actions
      case 'zoom':
        mapViewComponent.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setOfflineMapsModalVisible({bool: !isOfflineMapModalVisible}));
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MapModes.DRAW.FREEHANDPOLYGON);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapViewComponent.current.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MapModes.DRAW.POLYGON);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setProjectLoadSelectionModalVisible({bool: false}));
  };

  const closeNotebookPanel = () => {
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    dispatch(setNotebookPanelVisible(false));
    dispatch(setAllSpotsPanelVisible(false));
  };

  // const closeSidePanel = () => {
  //   console.log('Closing Side Panel');
  //   // dispatch({type: mainMenuPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
  //   animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
  //   animatePanels(customMapsSidePanelAnimation, -customMapsSidePanelWidth);
  // };

  const deleteSpot = id => {
    const spot = props.spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            useSpots.deleteSpot(id)
              .then((res) => {
                console.log(res);
                closeNotebookPanel();
              });
          },
        },
      ],
    );
  };

  const deviceOrientation = () => {
    const dimensions = Dimensions.get('window');
    dispatch(gotDeviceDimensions({dims: dimensions}));
    console.log(deviceDimensions);
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    const newOrEditedSpot = await mapViewComponent.current.endDraw();
    setMapMode(MapModes.VIEW);
    toggleButton('endDrawButtonVisible', false);
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(NotebookPages.OVERVIEW);
    setIsSelectingForStereonet(false);
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapViewComponent.current.goToCurrentLocation();
      useHome.toggleLoading(false);
    }
    catch (err) {
      useHome.toggleLoading(false);
      Alert.alert('Geolocation Error', err);
    }
  };

  const modalHandler = (page, modalType) => {
    if (isNotebookPanelVisible) {
      closeNotebookPanel();
      dispatch(setModalVisible({modal: modalType}));
    }
    else {
      openNotebookPanel(page);
      dispatch(setModalVisible({modal: modalType}));
    }
  };

  const notebookClickHandler = async name => {
    switch (name) {
      case 'menu':
        toggleDialog('notebookPanelMenuVisible');
        break;
      case 'export':
        console.log('Export button was pressed');
        break;
      case 'takePhoto':
        useImages.launchCameraFromNotebook().then((imagesSavedLength) => {
          imagesSavedLength === 1
            ? toastRef.current.show(`${imagesSavedLength} photo saved!`)
            : toastRef.current.show(`${imagesSavedLength} photos saved!`);
        });
        break;
      case 'importPhoto':
        useImages.getImagesFromCameraRoll();
        break;
      case 'showGeographyInfo':
        dispatch(setNotebookPageVisible(NotebookPages.GEOGRAPHY));
        break;
      case 'setToCurrentLocation':
        const currentLocation = await useMaps.getCurrentLocation();
        let editedSpot = JSON.parse(JSON.stringify(selectedSpot));
        editedSpot.geometry = turf.point(currentLocation).geometry;
        dispatch({type: spotReducers.ADD_SPOT, spot: editedSpot});
        dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: editedSpot});
        break;
      case 'setFromMap':
        mapViewComponent.current.createDefaultGeom();
        closeNotebookPanel();
        break;
    }
  };

  const openNotebookPanel = pageView => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || NotebookPages.OVERVIEW));
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    dispatch(setNotebookPanelVisible(true));
  };

  const renderAllSpotsPanel = () => {
    return (
      <View style={[notebookStyles.allSpotsPanel]}>
        <AllSpotsPanel/>
      </View>
    );
  };

  const renderFloatingViews = () => {
    if (modalVisible === Modals.NOTEBOOK_MODALS.TAGS && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <TagsNotebookModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.TAGS) {
      return (
        <TagsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) {
      return (
        <AddTagsToSpotsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === Modals.NOTEBOOK_MODALS.COMPASS && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookCompassModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      return (
        <ShortcutCompassModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NotebookPages.MEASUREMENT, Modals.NOTEBOOK_MODALS.COMPASS)}
        />
      );
    }
    if (modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE && isNotebookPanelVisible
      && !isEmpty(selectedSpot)) {
      return (
        <NotebookSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(null, Modals.SHORTCUT_MODALS.SAMPLE)}
        />
      );
    }
    else if (modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      return (
        <ShortcutSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(NotebookPages.SAMPLE, Modals.NOTEBOOK_MODALS.SAMPLE)}
        />
      );
    }
    if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
      return (
        <ShortcutNotesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NotebookPages.NOTE)}
        />
      );
    }
  };

  const renderLoadProjectFromModal = () => {
    return (
      <InitialProjectLoadModal
        openMainMenu={() => toggleHomeDrawerButton()}
        visible={isProjectLoadSelectionModalVisible}
        closeModal={() => closeInitialProjectLoadModal()}
      />
    );
  };

  const renderInfoDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status Info'}
        style={sharedDialogStyles.dialogWarning}
        visible={isInfoMessagesModalVisible}
        onTouchOutside={() => dispatch(setInfoMessagesModalVisible({bool: false}))}
      >
        <View style={{margin: 15}}>
          <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join(
            '\n')}</Text>
        </View>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(setInfoMessagesModalVisible({bool: false}))}
        />
      </StatusDialogBox>
    );
  };

  const renderErrorMessageDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Error...'}
        style={sharedDialogStyles.dialogWarning}
        visible={isErrorMessagesModalVisible}
      >
        <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join(
          '\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(setErrorMessagesModalVisible({bool: false}))}
        />
      </StatusDialogBox>
    );
  };

  const renderSaveAndCancelDrawButtons = () => {
    return (
      <View style={homeStyles.drawSaveAndCancelButtons}>
        {buttons.endDrawButtonVisible && <Button
          containerStyle={{alignContent: 'center'}}
          buttonStyle={homeStyles.drawToolsButtons}
          titleStyle={{color: 'black'}}
          title={'End Draw'}
          onPress={clickHandler.bind(this, 'endDraw')}
        />}
        {buttons.editButtonsVisible && <View>
          <Button
            buttonStyle={homeStyles.drawToolsButtons}
            titleStyle={{color: 'black'}}
            title={'Save Edits'}
            onPress={() => clickHandler('saveEdits')}
          />
          <Button
            buttonStyle={[homeStyles.drawToolsButtons, {marginTop: 5}]}
            titleStyle={{color: 'black'}}
            title={'Cancel Edits'}
            onPress={() => clickHandler('cancelEdits')}
          />
        </View>}
      </View>
    );
  };

  const renderSaveMapsModal = () => {
    return (
      <SaveMapsModal
        visible={isOfflineMapModalVisible}
        close={() => dispatch(setOfflineMapsModalVisible({bool: false}))}
        map={mapViewComponent.current}
      />
    );
  };

  const renderSidePanelView = () => {
    if (deviceWidth < 600) {
      return <Animated.View
        style={[sidePanelStyles.sidePanelContainerPhones, animateMainMenuSidePanel]}>
        {renderSidePanelContent()}
      </Animated.View>;
    }
    return <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
      {renderSidePanelContent()}
    </Animated.View>;
  };

  const renderSidePanelContent = () => {
    switch (sidePanelView) {
      case mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.MANAGE_CUSTOM_MAP:
        return (
          <CustomMapDetails/>
        );
      case mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.PROJECT_DESCRIPTION:
        return (
          <ProjectDescription/>
        );
      case mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL:
        return (
          <TagDetailSidePanel
            openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
        );
      case mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS:
        return (
          <TagAddRemoveSpots/>
        );
    }
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        onTouchOutside={() => dispatch(setStatusMessagesModalVisible({bool: false}))}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{minHeight: 100}}>
          {isModalLoading && (
            <View style={{flex: 1}}>
              <BallIndicator
                color={'darkgrey'}
                count={8}
                size={30}
              />
            </View>
          )}
          <View style={{flex: 1, paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            {statusMessages.includes('Download Complete!') || statusMessages.includes('Upload Complete!')
            || statusMessages.includes('There are no active datasets.') || statusMessages.includes('Success!')
            || statusMessages.includes('Project Backup Complete!') || statusMessages.includes('Project loaded!')
              ? (
                <Button
                  title={'OK'}
                  type={'clear'}
                  onPress={() => dispatch(setStatusMessagesModalVisible({bool: false}))}
                />
              )
              : null
            }
          </View>
        </View>
      </StatusDialogBox>
    );
  };

  const samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected');
  };

  const setDraw = async mapModeToSet => {
    mapViewComponent.current.cancelDraw();
    if (mapMode === MapModes.VIEW && mapModeToSet !== MapModes.DRAW.POINT) {
      toggleButton('endDrawButtonVisible', true);
    }
    else if (mapMode === mapModeToSet
      || (mapMode === MapModes.DRAW.FREEHANDPOLYGON && mapModeToSet === MapModes.DRAW.POLYGON)
      || (mapMode === MapModes.DRAW.FREEHANDLINE && mapModeToSet === MapModes.DRAW.LINE)
    ) mapModeToSet = MapModes.VIEW;
    setMapMode(mapModeToSet);
    if (mapModeToSet === MapModes.VIEW) {
      toggleButton('endDrawButtonVisible', false);
    }
    //props.setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapViewComponent.current.saveEdits();
    //cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const startEdit = () => {
    setMapMode(MapModes.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
    //  toggleButton('editButtonsVisible', true);
    //   toggleButton('drawButtonsVisible', false);
  };

  // Toggle given button between true (on) and false (off)
  const toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !buttons[button]);
    setButtons({
      ...buttons,
      [button]: isVisible !== undefined ? isVisible : !buttons[button],
    });
  };

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = dialog => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const toggleHomeDrawerButton = () => {
    if (isMainMenuPanelVisible) {
      dispatch(setMainMenuPanelVisible({bool: false}));
      dispatch(setMenuSelectionPage({name:undefined}));
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      dispatch(setMainMenuPanelVisible({bool: true}));
      animatePanels(MainMenuPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const toggleImageModal = () => {
    dispatch(setImageModalVisible({bool: !isImageModalVisible}));
  };

  const toggleNotebookPanel = () => {
    if (isNotebookPanelVisible) closeNotebookPanel();
    else openNotebookPanel();
  };

  const toggleSidePanel = () => {
    if (isSidePanelVisible) {
      animatePanels(mainMenuSidePanelAnimation, mainMenuSidePanelWidth);
      return renderSidePanelView();
    }
    else {
      animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
    }
    return renderSidePanelView();
  };

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: MainMenuPanelAnimation}]};
  const animateMainMenuSidePanel = {transform: [{translateX: mainMenuSidePanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};
  let compassModal = null;
  let samplesModal = null;

  const MainMenu = (
    <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
      <MainMenuPanel
        // openSidePanel={(view, data) => openSidePanel(view, data)}
        openHomePanel={() => dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}))}
        closeHomePanel={() => toggleHomeDrawerButton()}
        openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
    </Animated.View>
  );

  const notebookPanel = (
    <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
      <NotebookPanel
        // onHandlerStateChange={(ev, name) => flingHandlerNotebook(ev, name)}
        closeNotebook={closeNotebookPanel}
        textStyle={{fontWeight: 'bold', fontSize: 12}}
        openMainMenu={() => toggleHomeDrawerButton()}
        onPress={name => notebookClickHandler(name)}/>
    </Animated.View>
  );

  return (
    <View style={homeStyles.container}>
      <Map
        mapComponentRef={mapViewComponent}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
      />
      {props.vertexStartCoords && <VertexDrag/>}
      <ToastPopup toastRef={toastRef}/>
      {Platform.OS === 'android' && (
        <View>
          {(modalVisible === Modals.NOTEBOOK_MODALS.COMPASS
            || modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}
          {(modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE
            || modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
        </View>
      )}
      <RightSideButtons
        toggleNotebookPanel={() => toggleNotebookPanel()}
        clickHandler={name => clickHandler(name)}
        drawButtonsVisible={buttons.drawButtonsVisible}
        mapMode={mapMode}
        rightsideIconAnimation={rightsideIconAnimation}
      />
      <LeftSideButtons
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        dialogClickHandler={(dialog, name) => dialogClickHandler(dialog, name)}
        clickHandler={(name, value) => clickHandler(name, value)}
        rightsideIconAnimation={rightsideIconAnimation}
        leftsideIconAnimation={leftsideIconAnimation}
      />
      <NotebookPanelMenu
        visible={dialogs.notebookPanelMenuVisible}
        onPress={(name, position) => dialogClickHandler('notebookPanelMenuVisible', name, position)}
        onTouchOutside={() => toggleDialog('notebookPanelMenuVisible')}
      />
      <Modal
        isVisible={isImageModalVisible}
        useNativeDriver={true}
        style={{flex: 1}}
      >
        <View style={homeStyles.modal}>
          <Button
            type={'clear'}
            titleProps={{color: 'white'}}
            title='Hide modal'
            onPress={() => toggleImageModal()}/>
          <Image
            source={props.selectedImage
              ? {uri: useImages.getLocalImageSrc(props.selectedImage.id)}
              : require('../../assets/images/noimage.jpg')}
            style={{width: wp('90%'), height: hp('90%')}}
          />
        </View>
      </Modal>
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {isAllSpotsPanelVisible && renderAllSpotsPanel()}
      {MainMenu}
      {renderSaveAndCancelDrawButtons()}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {renderFloatingViews()}
      {renderLoadProjectFromModal()}
      {renderStatusDialogBox()}
      {renderInfoDialogBox()}
      {renderErrorMessageDialogBox()}
      {isOfflineMapModalVisible && renderSaveMapsModal()}
    </View>
  );
};

function mapStateToProps(state) {
  return {
    currentImageBasemap: state.map.currentImageBasemap,
    selectedImage: state.spot.selectedAttributes[0],
    spots: state.spot.spots,
    getCurrentProject: state.project.project,
    vertexStartCoords: state.map.vertexStartCoords,
  };
}

const mapDispatchToProps = {
  deleteSpot: (id) => ({type: spotReducers.DELETE_SPOT, id: id}),
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  onSpotEditImageObj: (images) => ({type: spotReducers.EDIT_SPOT_IMAGES, images: images}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
