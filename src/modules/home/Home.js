import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, FlatList, Platform, Text, TextInput, View} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import * as turf from '@turf/turf';
import moment from 'moment';
import {Button} from 'react-native-elements';
import {FlatListSlider} from 'react-native-flatlist-slider';
import {DotIndicator} from 'react-native-indicators';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import useDownloadHook from '../../services/useDownload';
import useExportHook from '../../services/useExport';
import useImportHook from '../../services/useImport';
import useUploadHook from '../../services/useUpload';
import commonStyles from '../../shared/common.styles';
import {animatePanels, isEmpty, truncateText} from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import ToastPopup from '../../shared/ui/Toast';
import CompassModal from '../compass/CompassModal';
import MeasurementTemplatesModal from '../compass/MeasurementTemplatesModal';
import Preview from '../images/Preview';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import Map from '../maps/Map';
import {MAP_MODES} from '../maps/maps.constants';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapsHook from '../maps/useMaps';
import VertexDrag from '../maps/VertexDrag';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import InitialProjectLoadModal from '../project/InitialProjectLoadModal';
import projectStyles from '../project/project.styles';
import ProjectDescription from '../project/ProjectDescription';
import UploadDialogBox from '../project/UploadDialogBox';
import useProjectHook from '../project/useProject';
import NotebookSamplesModal from '../samples/NotebookSamplesModal';
import ShortcutSamplesModal from '../samples/ShortcutSamplesModal';
import {addedSpot, clearedSelectedSpots, setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {
  AddTagsToSpotsShortcutModal,
  TagAddRemoveSpots,
  TagDetailSidePanel,
  TagsNotebookModal,
  TagsShortcutModal,
} from '../tags';
import UserProfile from '../user/UserProfilePage';
import {MODALS} from './home.constants';
import {
  setBackupModalVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalVisible,
  setOfflineMapsModalVisible,
  setOnlineStatus,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setSelectedProject,
  setStatusMessagesModalVisible,
  setUploadModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';

const Home = () => {
  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceDimensions = Dimensions.get(platform);
  const homeMenuPanelWidth = 300;
  const mainMenuSidePanelWidth = 300;
  const notebookPanelWidth = 400;
  const urlConditions = ['http', 'https'];

  const useExport = useExportHook();
  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const navigation = useNavigation();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const useDevice = useDeviceHook();
  const useUpload = useUploadHook();
  const useDownload = useDownloadHook();
  const useImport = useImportHook();


  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const currentProject = useSelector(state => state.project.project);
  const customMaps = useSelector(state => state.map.customMaps);
  const isBackModalVisible = useSelector(state => state.home.isBackupModalVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isImageModalVisible = useSelector(state => state.home.isImageModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isModalLoading = useSelector(state => state.home.loading.modal);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isSidePanelVisible = useSelector(state => state.mainMenu.isSidePanelVisible);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const [openMenu, setOpenMenu] = useState('');
  const selectedProject = useSelector(state => state.home.selectedProject);
  const isUploadModalVisible = useSelector(state => state.home.isUploadModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const sidePanelView = useSelector(state => state.mainMenu.sidePanelView);
  const spots = useSelector(state => state.spot.spots);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const user = useSelector(state => state.user);
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    drawButtonsVisible: true,
    editButtonsVisible: false,
    userLocationButtonOn: false,
  });
  const [isConnectedStatus, setIsConnectedStatus] = useState(null);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  // const [customMapsSidePanelAnimation] = useState(new Animated.Value(-customMapsSidePanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [imageSlideshowData, setImageSlideshowData] = useState([]);
  const [exportFileName, setExportFileName] = useState('');
  const mapComponentRef = useRef(null);
  const toastRef = useRef(null);

  useEffect(() => {
    // useDevice.loadOfflineMaps().catch();
    NetInfo.addEventListener(status => {
      setIsConnectedStatus(status.isInternetReachable);
      if (status.isInternetReachable) {
        dispatch(setOnlineStatus(true));
      }
      if (status.isInternetReachable === false) {
        dispatch(setOnlineStatus(false));
      }
    });
  }, []);

  useEffect(() => {
    console.log('Selected Project', selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    if (user.email && user.name && !__DEV__) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': user.email, username: user.name});
      });
    }
    useDevice.doesDeviceBackupDirExist().catch(err => console.log('Error checking if backup dir exists!', err));
    console.log('Initializing Home page');
  }, [user]);

  useEffect(() => {
    dispatch(setProjectLoadSelectionModalVisible(isEmpty(currentProject)));
    if (!isEmpty(currentProject)) {
      setExportFileName(moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + currentProject.description.project_name);
    }
  }, [currentProject, user]);

  useEffect(() => {
    if (currentImageBasemap && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap cleanup UE');
    };
  }, [currentImageBasemap, customMaps]);

  useEffect(() => {
    if (isImageModalVisible) populateImageSlideshowData();
    else setImageSlideshowData([]);
  }, [isImageModalVisible]);

  const populateImageSlideshowData = () => {
    toggleHomeDrawerButton();
    let image = selectedImage;
    let firstImageID = selectedImage.id;
    let uri = useImages.getLocalImageURI(firstImageID);
    let firstSlideshowImage = {image, uri};
    const imagesForSlideshow = Object.values(useSpots.getActiveSpotsObj()).reduce((acc, spot) => {
      const imagesForSlideshow1 = spot.properties.images
        && spot.properties.images.reduce((acc1, img) => {
          uri = useImages.getLocalImageURI(img.id);
          return (img.id !== firstImageID) ? [...acc1, {img, uri}] : acc1;
        }, []) || [];
      return [...acc, ...imagesForSlideshow1];
    }, []);
    setImageSlideshowData([firstSlideshowImage, ...imagesForSlideshow]);
  };

  useEffect(() => {
    if (projectLoadComplete) {
      mapComponentRef.current.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  const cancelEdits = async () => {
    await mapComponentRef.current.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    // toggleButton('editButtonsVisible', false);
    // toggleButton('drawButtonsVisible', true);
  };

  const clickHandler = async (name, value) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) dispatch(setModalVisible({modal: null}));
        else modalHandler(null, MODALS.SHORTCUT_MODALS.TAGS);
        closeNotebookPanel();
        break;
      case 'measurement':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.COMPASS}));
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.SAMPLE}));
        closeNotebookPanel();
        break;
      case 'note':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.NOTES}));
        closeNotebookPanel();
        break;
      case 'photo':
        dispatch(clearedSelectedSpots());
        const point = await useMaps.setPointAtCurrentLocation();
        if (point) {
          console.log('New Spot at current location:', point);
          const imagesSavedLength = await useImages.launchCameraFromNotebook();
          imagesSavedLength > 0 && toastRef.current.show(
            imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved in new Spot ' + point.properties.name);
          openNotebookPanel();
        }
        break;
      case 'sketch':
        dispatch(clearedSelectedSpots());
        if (modalVisible === MODALS.SHORTCUT_MODALS.SKETCH) {
          dispatch(setModalVisible({modal: null}));
        }
        else {
          dispatch(setModalVisible({modal: MODALS.SHORTCUT_MODALS.SKETCH}));
          navigation.navigate('Sketch');
        }
        break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Notebook Panel three-dot menu
      case 'closeNotebook':
        closeNotebookPanel();
        break;
      case 'copySpot':
        useSpots.copySpot();
        dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
        break;
      case 'deleteSpot':
        deleteSpot(selectedSpot.properties.id);
        break;
      case 'zoomToSpot':
        mapComponentRef.current.zoomToSpot();
        break;
      case 'showNesting':
        dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.NESTING));
        break;
      // Map Actions
      case MAP_MODES.DRAW.POINT:
      case MAP_MODES.DRAW.LINE:
      case MAP_MODES.DRAW.POLYGON:
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
      case MAP_MODES.DRAW.FREEHANDLINE:
      case MAP_MODES.DRAW.POINTLOCATION:
        dispatch(clearedSelectedSpots());
        if (!isEmpty(selectedDataset) && name === MAP_MODES.DRAW.POINTLOCATION) {
          setPointAtCurrentLocation();
        }
        else if (!isEmpty(selectedDataset)) setDraw(name).catch(console.error);
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
        if (value) goToCurrentLocation().catch(console.error);
        mapComponentRef.current.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        dispatch(setCurrentImageBasemap(undefined));
        break;
      // Map Actions
      case 'zoom':
        mapComponentRef.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setOfflineMapsModalVisible(!isOfflineMapModalVisible));
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setProjectLoadSelectionModalVisible(false));
  };

  const closeNotebookPanel = () => {
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    dispatch(setNotebookPanelVisible(false));
  };

  const deleteSpot = id => {
    const spot = spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }, {
        text: 'Delete',
        onPress: () => {
          useSpots.deleteSpot(id)
            .then((res) => {
              console.log(res);
              closeNotebookPanel();
            });
        },
      }],
    );
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    const newOrEditedSpot = await mapComponentRef.current.endDraw();
    setMapMode(MAP_MODES.VIEW);
    if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(NOTEBOOK_PAGES.OVERVIEW);
    setIsSelectingForStereonet(false);
    setIsSelectingForTagging(false);
    dispatch(setLoadingStatus({view: 'home', bool: false}));
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapComponentRef.current.goToCurrentLocation();
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
        const imagesSavedLength = await useImages.launchCameraFromNotebook();
        imagesSavedLength > 0 && toastRef.current.show(
          imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved');
        break;
      case 'importPhoto':
        useImages.getImagesFromCameraRoll();
        break;
      case 'showGeographyInfo':
        dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.GEOGRAPHY));
        break;
      case 'setToCurrentLocation':
        const currentLocation = await useMaps.getCurrentLocation();
        let editedSpot = JSON.parse(JSON.stringify(selectedSpot));
        editedSpot.geometry = turf.point([currentLocation.longitude, currentLocation.latitude]).geometry;
        if (currentLocation.altitude) editedSpot.properties.altitude = currentLocation.altitude;
        if (currentLocation.accuracy) editedSpot.properties.gps_accuracy = currentLocation.accuracy;
        dispatch(addedSpot(editedSpot));
        dispatch(setSelectedSpot(editedSpot));
        break;
      case 'setFromMap':
        mapComponentRef.current.createDefaultGeom();
        closeNotebookPanel();
        break;
    }
  };

  const openNotebookPanel = pageView => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || NOTEBOOK_PAGES.OVERVIEW));
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    dispatch(setNotebookPanelVisible(true));
  };

  const renderFloatingViews = () => {
    if (modalVisible === MODALS.NOTEBOOK_MODALS.TAGS && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <TagsNotebookModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) {
      return (
        <TagsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) {
      return (
        <AddTagsToSpotsShortcutModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <CompassModal
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.COMPASS)}
          type={MODALS.NOTEBOOK_MODALS.COMPASS}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      return (
        <CompassModal
          onPress={() => modalHandler(NOTEBOOK_PAGES.MEASUREMENT, MODALS.NOTEBOOK_MODALS.COMPASS)}
          type={MODALS.SHORTCUT_MODALS.COMPASS}
        />
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_PLANAR
      || modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_PLANAR_TEMPLATE_FORM) {
      return (
        <MeasurementTemplatesModal type={'planar_orientation'}/>
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_LINEAR
      || modalVisible === MODALS.NOTEBOOK_MODALS.MEASUREMENT_LINEAR_TEMPLATE_FORM) {
      return (
        <MeasurementTemplatesModal type={'linear_orientation'}/>
      );
    }
    if (modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE && isNotebookPanelVisible && !isEmpty(selectedSpot)) {
      return (
        <NotebookSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(null, MODALS.SHORTCUT_MODALS.SAMPLE)}
        />
      );
    }
    else if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
      return (
        <ShortcutSamplesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          cancel={() => samplesModalCancel()}
          onPress={() => modalHandler(NOTEBOOK_PAGES.SAMPLE, MODALS.NOTEBOOK_MODALS.SAMPLE)}
        />
      );
    }
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      return (
        <ShortcutNotesModal
          close={() => dispatch(setModalVisible({modal: null}))}
          onPress={() => modalHandler(NOTEBOOK_PAGES.NOTE)}
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
        style={commonStyles.dialogWarning}
        visible={isInfoMessagesModalVisible}
        // onTouchOutside={() => dispatch(setInfoMessagesModalVisible(false))}
      >
        <View style={{margin: 15}}>
          <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        </View>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch(setInfoMessagesModalVisible(false))}
        />
      </StatusDialogBox>
    );
  };

  const renderErrorMessageDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Error...'}
        style={commonStyles.dialogWarning}
        visible={isErrorMessagesModalVisible}
      >
        <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => {
            if (openMenu === 'Active Project') {
              dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
              setOpenMenu('');
              dispatch(setStatusMessagesModalVisible(false));
            }
            dispatch(setErrorMessagesModalVisible(false));
          }}
        />
      </StatusDialogBox>
    );
  };

  const renderOfflineMapViewLabel = () => {
    return (
      <View style={homeStyles.offlineMapLabelContainer}>
        <Text style={homeStyles.offlineMapViewLabel}>Offline View</Text>
      </View>
    );
  };

  const renderSaveAndCancelDrawButtons = () => {
    return (
      <View>
        {buttons.editButtonsVisible && <View style={homeStyles.editButtonsContainer}>
          <Button
            containerStyle={{padding: 5}}
            buttonStyle={homeStyles.drawToolsButtons}
            titleStyle={homeStyles.drawToolsTitle}
            type={'clear'}
            title={'Save Edits'}
            onPress={() => clickHandler('saveEdits')}
          />
          <Button
            containerStyle={{padding: 5}}
            buttonStyle={{...homeStyles.drawToolsButtons, backgroundColor: 'white'}}
            titleStyle={{color: 'black'}}
            type={'clear'}
            title={'Cancel'}
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
        close={() => dispatch(setOfflineMapsModalVisible(false))}
        map={mapComponentRef.current}
      />
    );
  };

  const renderSidePanelView = () => {
    if (deviceDimensions.width < 600) {
      return (
        <Animated.View
          style={[sidePanelStyles.sidePanelContainerPhones, animateMainMenuSidePanel]}>
          {renderSidePanelContent()}
        </Animated.View>
      );
    }
    return (
      <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
        {renderSidePanelContent()}
      </Animated.View>
    );
  };

  const renderSidePanelContent = () => {
    switch (sidePanelView) {
      case SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP:
        return <CustomMapDetails/>;
      case SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION:
        return <ProjectDescription/>;
      case SIDE_PANEL_VIEWS.TAG_DETAIL:
        return <TagDetailSidePanel openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>;
      case SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_SPOTS:
        return <TagAddRemoveSpots/>;
      case SIDE_PANEL_VIEWS.USER_PROFILE:
        return <UserProfile/>;
    }
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={commonStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
      >
        <View style={{minHeight: 100}}>
          <View style={{paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            <View style={{paddingTop: 20}}>
              {isModalLoading ? (
                  <DotIndicator
                    color={'darkgrey'}
                    count={4}
                    size={8}
                  />
                )
                : (
                  <View style={{alignItems: 'center'}}>
                    {selectedProject.source !== ''
                    && <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Press Continue to load selected
                      project</Text>}
                    <View style={{flexDirection: 'row'}}>
                      <Button
                        title={selectedProject.source !== '' ? 'Continue' : 'OK'}
                        type={'clear'}
                        containerStyle={{padding: 10}}
                        onPress={() => getProjectFromSource(selectedProject)}
                      />
                      {selectedProject.source !== ''
                      && <Button
                        title={'Cancel'}
                        containerStyle={{padding: 10}}
                        type={'clear'}
                        onPress={() => dispatch(setStatusMessagesModalVisible(false))}
                      />}
                    </View>
                  </View>
                )
              }
            </View>
          </View>
        </View>
      </StatusDialogBox>
    );
  };

  const getProjectFromSource = async () => {
    if (selectedProject.source === 'device') {
      console.log('FROM DEVICE', selectedProject.project);
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      const res = await useImport.loadProjectFromDevice(selectedProject.project);
      console.log('Done loading project', res);
    }
    else if (selectedProject.source === 'server') {
      console.log('FROM SERVER', selectedProject.project);
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      const projectData = await useDownload.initializeDownload(selectedProject.project);
      console.log('PROJECT DATA', projectData);
    }
    else dispatch(setStatusMessagesModalVisible(false));
  };

  const renderDatasetNames = () => {
    const activeDatasets = useProject.getActiveDatasets();
    return (
      <FlatList
        data={activeDatasets}
        renderItem={({item}) =>
          <Text>{item.name.length > 30 ? '- ' + truncateText(item.name, 30)
            : '- ' + item.name}</Text>
        }
      />
    );
  };

  const renderBackUpModal = () => {
    const fileName = exportFileName.replace(/\s/g, '');
    return (
      <UploadDialogBox
        dialogTitle={'Confirm or Change Folder Name'}
        visible={isBackModalVisible}
        cancel={() => dispatch(setBackupModalVisible(false))}
        onPress={() => useExport.initializeBackup(exportFileName)}
        buttonText={'Backup'}
        disabled={exportFileName === ''}
      >
        <View>
          <View style={{alignItems: 'center', paddingTop: 15}}>
            <Text style={{...commonStyles.dialogText, textAlign: undefined}}>The following are the datasets that will be
              exported:</Text>
            <Text style={{...commonStyles.dialogText, textAlign: undefined}}>{renderDatasetNames()}</Text>
            <Text>If you change the folder name please do not use spaces, special characters (except a dash or
              underscore), or add a file extension.</Text>
          </View>
          <View style={projectStyles.dialogContent}>
            <TextInput
              value={fileName}
              onChangeText={text => setExportFileName(text)}
              style={commonStyles.dialogInputContainer}
            />
          </View>
        </View>
      </UploadDialogBox>
    );
  };

  const renderToastMessage = () => {
    toastRef.current.show('HELLO!!!');
  };

  const renderUploadModal = () => {
    const activeDatasets = useProject.getActiveDatasets();
    return (
      <UploadDialogBox
        dialogTitle={'OVERWRITE WARNING!'}
        visible={isUploadModalVisible}
        cancel={() => dispatch(setUploadModalVisible(false))}
        buttonText={'Upload'}
        onPress={async () => {
          toggleHomeDrawerButton();
          await useUpload.initializeUpload();
        }}
      >
        <View>
          <Text>
            <Text style={commonStyles.dialogContentImportantText}>{!isEmpty(
              currentProject) && currentProject.description.project_name} </Text>
            project properties and the following active datasets will be uploaded and will
            <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
            for this project:
          </Text>
          <View style={{alignItems: 'center', paddingTop: 15, paddingBottom: 10}}>
            <FlatList
              data={activeDatasets}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <Text>{item.name.length > 30 ? '- ' + truncateText(item.name, 30)
                : '- ' + item.name}</Text>}
            />
          </View>
        </View>
      </UploadDialogBox>
    );
  };

  const samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected');
  };

  const setDraw = async mapModeToSet => {
    mapComponentRef.current.cancelDraw();
    if (mapMode === mapModeToSet
      || (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON && mapModeToSet === MAP_MODES.DRAW.POLYGON)
      || (mapMode === MAP_MODES.DRAW.FREEHANDLINE && mapModeToSet === MAP_MODES.DRAW.LINE)
    ) mapModeToSet = MAP_MODES.VIEW;
    setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapComponentRef.current.saveEdits();
    //cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const setPointAtCurrentLocation = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      await useMaps.setPointAtCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toastRef.current.show(
        `Point Spot Added at Current\n Location to Dataset ${useProject.getSelectedDatasetFromId().name.toUpperCase()}`,
      );
      openNotebookPanel();
    }
    catch (err) {
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      console.error('Error setting point to current location', err);
    }
  };

  const startEdit = () => {
    setMapMode(MAP_MODES.EDIT);
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
      dispatch(setMainMenuPanelVisible(false));
      dispatch(setMenuSelectionPage({name: undefined}));
      animatePanels(MainMenuPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      dispatch(setMainMenuPanelVisible(true));
      animatePanels(MainMenuPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const toggleImageModal = () => {
    dispatch(setImageModalVisible(!isImageModalVisible));
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
    else animatePanels(mainMenuSidePanelAnimation, -mainMenuSidePanelWidth);
    return renderSidePanelView();
  };

  const onLogout = () => {
    toggleHomeDrawerButton();
    closeNotebookPanel();
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
        logout={() => onLogout()}
        openMainMenu={(action) => setOpenMenu(action)}
        closeMainMenuPanel={() => toggleHomeDrawerButton()}
        openNotebookPanel={(pageView) => openNotebookPanel(pageView)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
        zoomToCustomMap={(bbox) => mapComponentRef.current.zoomToCustomMap(bbox)}
      />
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
        mapComponentRef={mapComponentRef}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
      />
      {/*<View style={{position: 'absolute', right: '40%', bottom: 10, backgroundColor: 'white', padding: 10}}>*/}
      {/*  <Text>ONLINE STATUS: {isOnline.toString()}</Text>*/}
      {/*</View>*/}
      {vertexStartCoords && <VertexDrag/>}
      <ToastPopup toastRef={toastRef}/>
      {Platform.OS === 'android' && (
        <View>
          {(modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS || modalVisible === MODALS.SHORTCUT_MODALS.COMPASS)
          && compassModal}
          {(modalVisible === MODALS.NOTEBOOK_MODALS.SAMPLE || modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE)
          && samplesModal}
        </View>
      )}
      <RightSideButtons
        toggleNotebookPanel={() => toggleNotebookPanel()}
        clickHandler={name => clickHandler(name)}
        drawButtonsVisible={buttons.drawButtonsVisible}
        mapMode={mapMode}
        endDraw={() => endDraw()}
        rightsideIconAnimation={rightsideIconAnimation}
      />
      <LeftSideButtons
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        dialogClickHandler={(dialog, name) => dialogClickHandler(dialog, name)}
        clickHandler={(name, value) => clickHandler(name, value)}
        // rightsideIconAnimation={rightsideIconAnimation}
        leftsideIconAnimation={leftsideIconAnimation}
        zoomToCustomMap={(bbox) => mapComponentRef.current.zoomToCustomMap(bbox)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
      />
      <NotebookPanelMenu
        visible={dialogs.notebookPanelMenuVisible}
        onPress={(name, position) => dialogClickHandler('notebookPanelMenuVisible', name, position)}
        onTouchOutside={() => toggleDialog('notebookPanelMenuVisible')}
      />
      {(imageSlideshowData.length) > 0 && (
        <View>
          <FlatListSlider
            data={imageSlideshowData}
            imageKey={'uri'}
            autoscroll={false}
            separator={0}
            loop={true}
            width={deviceDimensions.width}
            height={deviceDimensions.height}
            indicatorContainerStyle={{position: 'absolute', top: 20}}
            component={(
              <Preview
                toggle={() => toggleImageModal()}
                openNotebookPanel={(page) => openNotebookPanel(page)}
              />
            )}
          />
        </View>
      )}
      {isHomeLoading && <LoadingSpinner/>}
      {notebookPanel}
      {MainMenu}
      {isOnline && currentBasemap
      && !urlConditions.some(el => currentBasemap.url[0].includes(el)) && renderOfflineMapViewLabel()}
      {renderSaveAndCancelDrawButtons()}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {renderFloatingViews()}
      {renderLoadProjectFromModal()}
      {renderStatusDialogBox()}
      {renderInfoDialogBox()}
      {renderErrorMessageDialogBox()}
      {renderUploadModal()}
      {renderBackUpModal()}
      {isOfflineMapModalVisible && renderSaveMapsModal()}
    </View>
  );
};

export default Home;
