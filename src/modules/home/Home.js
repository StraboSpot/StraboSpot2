import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Keyboard, Platform, Text, TextInput, View} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {Button} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import useDeviceHook from '../../services/useDevice';
import useExportHook from '../../services/useExport';
import * as Helpers from '../../shared/Helpers';
import {animatePanels, isEmpty} from '../../shared/Helpers';
import LoadingSpinner from '../../shared/ui/Loading';
import uiStyles from '../../shared/ui/ui.styles';
import ImageSlider from '../images/ImageSlider';
import useImagesHook from '../images/useImages';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import sidePanelStyles from '../main-menu-panel/sidePanel.styles';
import CustomMapDetails from '../maps/custom-maps/CustomMapDetails';
import Map from '../maps/Map';
import {MAP_MODES} from '../maps/maps.constants';
import {clearedStratSection, setCurrentImageBasemap} from '../maps/maps.slice';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useLocationHook from '../maps/useLocation';
import VertexDrag from '../maps/VertexDrag';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import {MODAL_KEYS, MODALS, PAGE_KEYS} from '../page/page.constants';
import ProjectDescription from '../project/ProjectDescription';
import useProjectHook from '../project/useProject';
import {clearedSelectedSpots, setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {TagAddRemoveFeatures, TagAddRemoveSpots, TagDetailSidePanel} from '../tags';
import UserProfile from '../user/UserProfilePage';
import BackupModal from './home-modals/BackupModal';
import ErrorModal from './home-modals/ErrorModal';
import InfoModal from './home-modals/InfoModal';
import InitialProjectLoadModal from './home-modals/InitialProjectLoadModal';
import StatusModal from './home-modals/StatusModal';
import UploadModal from './home-modals/UploadModal';
import UploadProgressModal from './home-modals/UploadProgressModal';
import WarningModal from './home-modals/WarningModal';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setImageModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalVisible,
  setOfflineMapsModalVisible,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import useHomeHook from './useHome';

const {State: TextInputState} = TextInput;

const Home = ({navigation, route}) => {

  const platform = Platform.OS === 'ios' ? 'window' : 'screen';
  const deviceDimensions = Dimensions.get(platform);
  const homeMenuPanelWidth = 300;
  const mainMenuSidePanelWidth = 300;
  const notebookPanelWidth = 400;

  const useExport = useExportHook();
  const [useHome] = useHomeHook();
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const toast = useToast();
  const useDevice = useDeviceHook();
  const useLocation = useLocationHook();

  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isImageModalVisible = useSelector(state => state.home.isImageModalVisible);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isSidePanelVisible = useSelector(state => state.mainMenu.isSidePanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedImage = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const sidePanelView = useSelector(state => state.mainMenu.sidePanelView);
  const stratSection = useSelector(state => state.map.stratSection);
  const user = useSelector(state => state.user);
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

  const [buttons, setButtons] = useState({
    drawButtonsVisible: true,
    editButtonsVisible: false,
    userLocationButtonOn: false,
  });
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
  });
  const [distance, setDistance] = useState(0);
  const [homeTextInputAnimate] = useState(new Animated.Value(0));
  const [imageSlideshowData, setImageSlideshowData] = useState([]);
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [MainMenuPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [mainMenuSidePanelAnimation] = useState(new Animated.Value(-mainMenuSidePanelWidth));
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);

  const animation = useRef(new Animated.Value(notebookPanelWidth)).current;
  const leftsideIconAnimationValue = useRef(new Animated.Value(0)).current;
  const rightsideIconAnimationValue = useRef(new Animated.Value(0)).current;
  const mapComponentRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      useImages.requestCameraPermission().then(
        res => console.log('Permission Status:', res));
    }
  }, []);

  useEffect(() => {
    console.log('NAVIGATION UE', route.params);
    const unsubscribe = navigation.addListener('focus', () => {
      route?.params?.pageKey === 'overview' && openNotebookPanel(route.params.pageKey);
    });
    return () => {
      console.log('Navigation Unsubscribed');
      return unsubscribe;
    };
  }, [navigation, route.params]);

  useEffect(() => {
    console.log('UE Home [user]', user);
    if (user.email && user.name) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': user.email, 'username': user.name});
      });
    }
  }, [user]);

  useEffect(() => {
    console.log('UE Home [currentImageBasemap, customMaps, stratSection]', currentImageBasemap, customMaps,
      stratSection);
    if ((currentImageBasemap || stratSection) && isMainMenuPanelVisible) toggleHomeDrawerButton();
    return function cleanUp() {
      console.log('currentImageBasemap and stratSection cleanup UE');
    };
  }, [currentImageBasemap, customMaps, stratSection]);

  useEffect(() => {
    console.log('UE Home [modalVisible]', modalVisible);
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome);
      console.log('Keyboard listeners added to HOME');
      return function cleanup() {
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome).remove();
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome).remove();
        console.log('Home Keyboard Listeners Removed');
      };
    }
  }, [modalVisible]);

  useEffect(() => {
    console.log('UE Home [projectLoadComplete]', projectLoadComplete);
    if (projectLoadComplete) {
      mapComponentRef.current.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  useEffect(() => {
    console.log('UE Home [mapMode]', mapMode);
    if (mapMode !== MAP_MODES.DRAW.MEASURE) mapComponentRef.current.endMapMeasurement();
  }, [mapMode]);

  const handleKeyboardDidShowHome = event => Helpers.handleKeyboardDidShow(event, TextInputState,
    homeTextInputAnimate);

  const handleKeyboardDidHideHome = () => Helpers.handleKeyboardDidHide(homeTextInputAnimate);

  const cancelEdits = async () => {
    await mapComponentRef.current.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const clickHandler = async (name, value) => {
    switch (name) {
      // case 'search':
      //   toast.show(`Still in the works. \n The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
      //   break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Map Actions
      case MAP_MODES.DRAW.POINT:
      case MAP_MODES.DRAW.LINE:
      case MAP_MODES.DRAW.POLYGON:
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
      case MAP_MODES.DRAW.FREEHANDLINE:
      case MAP_MODES.DRAW.POINTLOCATION:
        dispatch(clearedSelectedSpots());
        if (!isEmpty(selectedDataset) && name === MAP_MODES.DRAW.POINTLOCATION) await setPointAtCurrentLocation();
        else if (!isEmpty(selectedDataset)) setDraw(name).catch(console.error);
        else toast.show('No Current Dataset! \n A current dataset needs to be set before drawing Spots.');
        break;
      case 'endDraw':
        await endDraw();
        break;
      case 'cancelEdits':
        await cancelEdits();
        break;
      case 'saveEdits':
        await saveEdits();
        break;
      case 'toggleUserLocation':
        if (value) goToCurrentLocation().catch(console.error);
        mapComponentRef.current.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        dispatch(setCurrentImageBasemap(undefined));
        break;
      case 'closeStratSection':
        dispatch(clearedStratSection());
        break;
      // Map Actions
      case 'zoom':
        mapComponentRef.current.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setOfflineMapsModalVisible(!isOfflineMapModalVisible));
        toggleHomeDrawerButton();
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        if (Platform.OS === 'ios') setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        else setDraw(MAP_MODES.DRAW.POLYGON).catch(console.error);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'mapMeasurement':
        setDraw(MAP_MODES.DRAW.MEASURE).catch(console.error);
        break;
      case 'stratSection':
        dispatch(setSelectedSpot(useSpots.getSpotWithThisStratSection(stratSection.strat_section_id)));
        openNotebookPanel(PAGE_KEYS.STRAT_SECTION);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setProjectLoadSelectionModalVisible(false));
  };

  const closeNotebookPanel = () => {
    console.log('Closing Notebook...');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    dispatch(setNotebookPanelVisible(false));
    if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
      dispatch(setModalVisible({modal: null}));
    }
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      const newOrEditedSpot = await mapComponentRef.current.endDraw();
      setMapMode(MAP_MODES.VIEW);
      if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(PAGE_KEYS.OVERVIEW);
      setIsSelectingForStereonet(false);
      setIsSelectingForTagging(false);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      console.error('Error at endDraw()', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
  };

  const exportProject = async () => {
    const exportCompleteMessage = Platform.OS === 'ios' ? `\n\nProject (${selectedProject.project.fileName}) has been exported!`
      : `\n\nProject (${selectedProject.project.fileName}) has been exported to the Downloads folder!`;
    dispatch(clearedStatusMessages());
    console.log('Exporting Project');
    dispatch(addedStatusMessage(`Exporting ${selectedProject.project.fileName}!`));
    await useExport.zipAndExportProjectFolder(selectedProject.project.fileName, selectedProject.project.fileName,
      true);
    dispatch(addedStatusMessage(exportCompleteMessage));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    console.log(`Project ${selectedProject.project.fileName} has been exported!`);
  };

  const goToCurrentLocation = async () => {
    useHome.toggleLoading(true);
    try {
      await mapComponentRef.current.goToCurrentLocation();
      useHome.toggleLoading(false);
    }
    catch (err) {
      console.error('Geolocation Error:', err);
      useHome.toggleLoading(false);
      toast.show(`${err.toString()}`);
    }
  };

  const openImageSlider = (selectedImage) => {
    navigation.navigate('ImageSlider', {selectedImage: selectedImage});
  };

  const modalHandler = (modalKey) => {
    if (isNotebookPanelVisible) {
      closeNotebookPanel();
      if (Object.values(MODAL_KEYS.SHORTCUTS).includes(modalKey)) dispatch(clearedSelectedSpots());
      dispatch(setModalVisible({modal: modalKey}));
    }
    else {
      openNotebookPanel(modalKey);
      if (modalKey !== PAGE_KEYS.NOTES) dispatch(setModalVisible({modal: modalKey}));
    }
  };

  const openNotebookPanel = (pageView) => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || PAGE_KEYS.OVERVIEW));
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    dispatch(setNotebookPanelVisible(true));
  };

  const openStraboSpotURL = () => useDevice.openURL('https://www.strabospot.org/login');

  const renderFloatingView = () => {
    const modal = MODALS.find(m => m.key === modalVisible);
    if (modal?.modal_component) {
      const ModalDisplayed = modal.modal_component;
      if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
        return (
          <ModalDisplayed
            modalKey={modal.key}
            onPress={modalHandler}
            goToCurrentLocation={goToCurrentLocation}
          />
        );
      }
      else return <ModalDisplayed modalKey={modal.key} onPress={modalHandler}/>;
    }
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

  const renderSidePanelView = () => {
    if (deviceDimensions.width < 600) {
      return (
        <Animated.View
          style={[sidePanelStyles.sidePanelContainerPhones, animateMainMenuSidePanel]}>
          <Animated.View style={{flex: 1, transform: [{translateY: homeTextInputAnimate}]}}>
            {renderSidePanelContent()}
          </Animated.View>
        </Animated.View>
      );
    }
    return (
      <Animated.View style={[sidePanelStyles.sidePanelContainer, animateMainMenuSidePanel]}>
        <Animated.View style={{flex: 1, transform: [{translateY: homeTextInputAnimate}]}}>
          {renderSidePanelContent()}
        </Animated.View>
      </Animated.View>
    );
  };

  const renderSidePanelContent = () => {
    switch (sidePanelView) {
      case SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP:
        return <CustomMapDetails/>;
      case SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION:
        return <ProjectDescription toastMessage={(message, type) => toast.show(message, {type: type})}/>;
      case SIDE_PANEL_VIEWS.TAG_DETAIL:
        return <TagDetailSidePanel openNotebookPanel={pageView => openNotebookPanel(pageView)}/>;
      case SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_SPOTS:
        return <TagAddRemoveSpots/>;
      case SIDE_PANEL_VIEWS.TAG_ADD_REMOVE_FEATURES:
        return <TagAddRemoveFeatures/>;
      case SIDE_PANEL_VIEWS.USER_PROFILE:
        return <UserProfile toast={(message, type) =>
          toast.show(message, {type: type})
        }/>;
    }
  };

  const setDraw = async (mapModeToSet) => {
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
      await useLocation.setPointAtCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show(
        `Point Spot Added at Current\n Location to Dataset ${useProject.getSelectedDatasetFromId().name.toUpperCase()}`,
        {
          type: 'success',
        },
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
  };

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = (dialog) => {
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

  const toggleOfflineMapLabel = () => {
    return Object.values(offlineMaps).some(offlineMap => offlineMap.isOfflineMapVisible === true);
  };

  const animateMainMenuSidePanel = {transform: [{translateX: mainMenuSidePanelAnimation}]};
  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: MainMenuPanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};

  const MainMenu = (
    <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
      <MainMenuPanel
        logout={() => onLogout()}
        closeMainMenuPanel={() => toggleHomeDrawerButton()}
        openNotebookPanel={pageView => openNotebookPanel(pageView)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
        zoomToCustomMap={bbox => mapComponentRef.current.zoomToCustomMap(bbox)}
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        imageSliderNavigation={val => openImageSlider(val)}
      />
    </Animated.View>
  );

  const renderNotebookPanel = () => {
    return (
      <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
        <NotebookPanel
          closeNotebookPanel={closeNotebookPanel}
          createDefaultGeom={() => mapComponentRef.current.createDefaultGeom()}
          openMainMenu={() => toggleHomeDrawerButton()}
          zoomToSpot={() => mapComponentRef.current.zoomToSpot()}
        />
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[homeStyles.container, {transform: [{translateY: homeTextInputAnimate}]}]}>
      <Map
        mapComponentRef={mapComponentRef}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        setDistance={d => setDistance(d)}
      />
      <View style={uiStyles.iconContainer}>
        {Platform.OS === 'ios' && <BatteryInfo/>}
        <ConnectionStatusIcon/>
      </View>
      {vertexStartCoords && <VertexDrag/>}
      <RightSideButtons
        closeNotebookPanel={closeNotebookPanel}
        openNotebookPanel={openNotebookPanel}
        toggleNotebookPanel={toggleNotebookPanel}
        clickHandler={name => clickHandler(name)}
        drawButtonsVisible={buttons.drawButtonsVisible}
        mapMode={mapMode}
        endDraw={() => endDraw()}
        rightsideIconAnimation={rightsideIconAnimation}
        distance={distance}
        endMeasurement={() => setMapMode(MAP_MODES.VIEW)}
      />
      <LeftSideButtons
        toggleHomeDrawer={() => toggleHomeDrawerButton()}
        dialogClickHandler={(dialog, name) => dialogClickHandler(dialog, name)}
        clickHandler={(name, value) => clickHandler(name, value)}
        // rightsideIconAnimation={rightsideIconAnimation}
        leftsideIconAnimation={leftsideIconAnimation}
        zoomToCustomMap={(bbox, duration) => mapComponentRef.current.zoomToCustomMap(bbox, duration)}
        zoomToCenterOfflineTile={() => mapComponentRef.current.zoomToCenterOfflineTile()}
        toast={message => toast.show(message, {type: 'warning'})}
      />
      {/*Modals for Home Page*/}
      <BackupModal/>
      {/*<BackUpOverwriteModal onPress={action => useProject.switchProject(action)}/>*/}
      <InfoModal/>
      {isProjectLoadSelectionModalVisible && (
        <InitialProjectLoadModal
          openMainMenu={() => toggleHomeDrawerButton()}
          visible={isProjectLoadSelectionModalVisible}
          closeModal={() => closeInitialProjectLoadModal()}
        />
      )}
      <ErrorModal/>
      <StatusModal
        openUrl={openStraboSpotURL}
        exportProject={() => exportProject()}
      />
      <UploadModal toggleHomeDrawer={() => toggleHomeDrawerButton()}/>
      <UploadProgressModal/>
      <WarningModal/>
      {/*------------------------*/}
      <LoadingSpinner isLoading={isHomeLoading}/>
      {renderNotebookPanel()}
      {MainMenu}
      {toggleOfflineMapLabel() && renderOfflineMapViewLabel()}
      {renderSaveAndCancelDrawButtons()}
      {isMainMenuPanelVisible && toggleSidePanel()}
      {modalVisible && renderFloatingView()}
      {mapComponentRef.current && isOfflineMapModalVisible && <SaveMapsModal map={mapComponentRef.current}/>}
    </Animated.View>
  );
};

export default Home;
