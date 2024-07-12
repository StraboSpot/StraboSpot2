import React, {useEffect, useRef, useState} from 'react';
import {Animated, Keyboard, Platform, TextInput, View} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  setIsMainMenuPanelVisible,
  setIsOfflineMapsModalVisible,
  setIsProjectLoadComplete,
  setIsProjectLoadSelectionModalVisible,
  setLoadingStatus,
  setModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import HomeView from './HomeView';
import HomeViewSmallScreen from './HomeViewSmallScreen';
import {
  BackupModal,
  ErrorModal,
  InitialProjectLoadModal,
  StatusModal,
  UploadModal,
  UploadProgressModal,
  WarningModal,
} from './modals';
import useDeviceHook from '../../services/useDevice';
import useExportHook from '../../services/useExport';
import VersionCheckHook from '../../services/versionCheck/useVersionCheck';
import VersionCheckLabel from '../../services/versionCheck/VersionCheckLabel';
import * as Helpers from '../../shared/Helpers';
import {animateDrawer, isEmpty} from '../../shared/Helpers';
import {MAIN_MENU_DRAWER_WIDTH, NOTEBOOK_DRAWER_WIDTH, SMALL_SCREEN} from '../../shared/styles.constants';
import LoadingSpinner from '../../shared/ui/Loading';
import useHomeHook from '../home/useHome';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import {MAP_MODES} from '../maps/maps.constants';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapLocationHook from '../maps/useMapLocation';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import {MODAL_KEYS, MODALS, PAGE_KEYS} from '../page/page.constants';
import useProjectHook from '../project/useProject';
import {clearedSelectedSpots, setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {logout} from '../user/userProfile.slice';

const {State: TextInputState} = TextInput;

const Home = ({navigation, route}) => {
  console.log('Rendering Home...');

  const useHome = useHomeHook();
  const useProject = useProjectHook();
  const useSpots = useSpotsHook();
  const toast = useToast();
  const useDevice = useDeviceHook();
  const useExport = useExportHook();
  const useMapLocation = useMapLocationHook();
  const useVersionCheck = VersionCheckHook();

  const selectedDataset = useProject.getSelectedDatasetFromId();

  const dispatch = useDispatch();
  const backupFileName = useSelector(state => state.project.backupFileName);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const stratSection = useSelector(state => state.map.stratSection);
  const userEmail = useSelector(state => state.user.email);
  const userName = useSelector(state => state.user.name);

  const [buttons, setButtons] = useState(
    {drawButtonsVisible: true, editButtonsVisible: false, userLocationButtonOn: false});
  const [dialogs, setDialogs] = useState(
    {mapActionsMenuVisible: false, mapSymbolsMenuVisible: false, baseMapMenuVisible: false});
  const [distance, setDistance] = useState(0);
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);
  const [showUpdateLabel, setShowUpdateLabel] = useState(false);

  const animatedValueLeftSide = useRef(new Animated.Value(0)).current;
  const animatedValueMainMenuDrawer = useRef(new Animated.Value(-MAIN_MENU_DRAWER_WIDTH)).current;
  const animatedValueNotebookDrawer = useRef(new Animated.Value(NOTEBOOK_DRAWER_WIDTH)).current;
  const animatedValueRightSide = useRef(new Animated.Value(0)).current;
  const animatedValueTextInputs = useRef(new Animated.Value(0)).current;
  const mapComponentRef = useRef(null);

  const animateMainMenuDrawer = {transform: [{translateX: animatedValueMainMenuDrawer}]};
  const animateNotebookDrawer = {transform: [{translateX: animatedValueNotebookDrawer}]};
  const animateTextInputs = {transform: [{translateY: animatedValueTextInputs}]};
  const animateLeftSide = {transform: [{translateX: animatedValueLeftSide}]};
  const animateRightSide = {transform: [{translateX: animatedValueRightSide}]};

  useEffect(() => {
    Platform.OS !== 'web' && useDevice.createProjectDirectories().catch(
      err => console.error('Error creating app directories', err));
  }, []);

  useEffect(() => {
    let updateTimer;
    if (!isProjectLoadSelectionModalVisible && Platform.OS !== 'web') {
      useVersionCheck.checkAppStoreVersion().then((res) => {
        if (res.needsUpdate) {
          setShowUpdateLabel(true);
          updateTimer = setTimeout(() => setShowUpdateLabel(false), 5000);
        }
      });
    }
    return () => {
      clearTimeout(updateTimer);
    };
  }, []);

  useEffect(() => {
    console.log('UE Home', '[navigation, route.params]', route.params);
    const unsubscribe = navigation.addListener('focus', () => {
      route?.params?.pageKey === 'overview' && openNotebookPanel(route.params.pageKey);
    });
    return () => {
      console.log('Navigation Unsubscribed');
      return unsubscribe;
    };
  }, [navigation, route.params]);

  useEffect(() => {
    console.log('UE Home [user]', userEmail);
    if (userEmail && userName) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': userEmail, 'username': userName});
      });
    }
  }, [userEmail, userName]);

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
      mapComponentRef.current?.zoomToSpotsExtent();
      dispatch(setIsProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  useEffect(() => {
    console.log('UE Home [mapMode]', mapMode);
    if (mapMode !== MAP_MODES.DRAW.MEASURE) mapComponentRef.current?.endMapMeasurement();
  }, [mapMode]);

  const handleKeyboardDidShowHome = event => Helpers.handleKeyboardDidShow(event, TextInputState,
    animatedValueTextInputs);

  const handleKeyboardDidHideHome = () => Helpers.handleKeyboardDidHide(animatedValueTextInputs);

  const cancelEdits = async () => {
    await mapComponentRef.current?.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    useHome.unlockOrientation();
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
      case 'cancelEdits':
        await cancelEdits();
        break;
      case 'saveEdits':
        await saveEdits();
        break;
      case 'toggleUserLocation':
        if (value) goToCurrentLocation().catch(console.error);
        mapComponentRef.current?.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        const spotWithThisImageBasemap = useSpots.getRootSpot(currentImageBasemap.id);
        useSpots.handleSpotSelected(spotWithThisImageBasemap);
        break;
      case 'closeStratSection':
        const spotWithThisStratSection = useSpots.getSpotWithThisStratSection(stratSection.strat_section_id);
        useSpots.handleSpotSelected(spotWithThisStratSection);
        break;
      // Map Actions
      case 'zoom':
        mapComponentRef.current?.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setIsOfflineMapsModalVisible(!isOfflineMapModalVisible));
        toggleHomeDrawerButton();
        break;
      case 'addTag':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current?.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        if (Platform.OS === 'ios') setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        else setDraw(MAP_MODES.DRAW.POLYGON).catch(console.error);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        mapComponentRef.current?.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'mapMeasurement':
        setDraw(MAP_MODES.DRAW.MEASURE).catch(console.error);
        break;
      case 'stratSection':
        const selectedSpotWithThisStratSection = useSpots.getSpotWithThisStratSection(stratSection.strat_section_id);
        useSpots.handleSpotSelected(selectedSpotWithThisStratSection);
        openNotebookPanel(PAGE_KEYS.STRAT_SECTION);
        break;
    }
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setIsProjectLoadSelectionModalVisible(false));
  };

  const closeMainMenuPanel = () => {
    dispatch(setIsMainMenuPanelVisible(false));
    dispatch(setMenuSelectionPage({name: null}));
    SMALL_SCREEN && dispatch(setSidePanelVisible(false));
    animateDrawer(animatedValueMainMenuDrawer, -MAIN_MENU_DRAWER_WIDTH);
    animateDrawer(animatedValueLeftSide, 0);
  };

  const closeNotebookPanel = () => {
    console.log('Closing Notebook...');
    animateDrawer(animatedValueNotebookDrawer, NOTEBOOK_DRAWER_WIDTH);
    animateDrawer(animatedValueRightSide, 0);
    dispatch(setNotebookPanelVisible(false));
    if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
      dispatch(setModalVisible({modal: null}));
    }
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const onEndDrawPressed = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      const newOrEditedSpot = await mapComponentRef.current?.endDraw();
      setMapMode(MAP_MODES.VIEW);
      if (!isEmpty(newOrEditedSpot) && !isSelectingForStereonet) openNotebookPanel(PAGE_KEYS.OVERVIEW);
      setIsSelectingForStereonet(false);
      setIsSelectingForTagging(false);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      console.error('Error at endDraw', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
  };

  const endMeasurement = () => setMapMode(MAP_MODES.VIEW);

  const exportProject = async () => {
    const exportCompleteMessage = Platform.OS === 'ios' ? `\n\nProject (${backupFileName}) has been exported!`
      : `\n\nProject (${selectedProject.project.fileName}) has been exported to the Downloads folder!`;

    dispatch(clearedStatusMessages());
    console.log('Exporting Project');
    dispatch(addedStatusMessage(`Exporting ${backupFileName}!`));
    await useExport.zipAndExportProjectFolder(true);
    dispatch(addedStatusMessage(exportCompleteMessage));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    console.log(`Project ${backupFileName} has been exported!`);
  };

  const goToCurrentLocation = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    try {
      await mapComponentRef.current?.goToCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      console.error('Geolocation Error:', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show(`${err.toString()}`);
    }
  };

  const modalHandler = (modalKey) => {
    if (isNotebookPanelVisible || SMALL_SCREEN) {
      if (isNotebookPanelVisible) closeNotebookPanel();
      if (Object.values(MODAL_KEYS.SHORTCUTS).includes(modalKey)) dispatch(clearedSelectedSpots());
      dispatch(setModalVisible({modal: modalKey}));
    }
    else {
      openNotebookPanel(modalKey);
      if (modalKey !== PAGE_KEYS.NOTES) dispatch(setModalVisible({modal: modalKey}));
    }
  };

  const openMainMenuPanel = () => {
    dispatch(setIsMainMenuPanelVisible(true));
    animateDrawer(animatedValueMainMenuDrawer, 0);
    animateDrawer(animatedValueLeftSide, MAIN_MENU_DRAWER_WIDTH);
  };

  const openNotebookPanel = (pageView) => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || PAGE_KEYS.OVERVIEW));
    dispatch(setNotebookPanelVisible(true));
    animateDrawer(animatedValueNotebookDrawer, 0);
    animateDrawer(animatedValueRightSide, -NOTEBOOK_DRAWER_WIDTH);
    if (SMALL_SCREEN) {
      navigation.navigate('HomeScreen', {screen: 'Notebook'});
      closeMainMenuPanel();
    }
  };

  const openSpotInNotebook = (spot, notebookPage, attributes) => {
    useSpots.handleSpotSelected(spot);
    if (attributes) dispatch(setSelectedAttributes(attributes));
    if (notebookPage) openNotebookPanel(notebookPage);
    else openNotebookPanel(PAGE_KEYS.OVERVIEW);
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

  const renderVersionCheckLabel = () => (
    <View style={homeStyles.versionPositionHome}>
      <VersionCheckLabel/>
    </View>
  );

  const setDraw = async (mapModeToSet) => {
    mapComponentRef.current?.cancelDraw();
    if (mapMode === mapModeToSet
      || (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON && mapModeToSet === MAP_MODES.DRAW.POLYGON)
      || (mapMode === MAP_MODES.DRAW.FREEHANDLINE && mapModeToSet === MAP_MODES.DRAW.LINE)
    ) mapModeToSet = MAP_MODES.VIEW;
    setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapComponentRef.current?.saveEdits();
    //cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    useHome.unlockOrientation();
  };

  const setPointAtCurrentLocation = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      await useMapLocation.setPointAtCurrentLocation();
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
    useHome.lockOrientation();
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
    if (isMainMenuPanelVisible) closeMainMenuPanel();
    else openMainMenuPanel();
  };

  const onLogout = () => {
    toggleHomeDrawerButton();
    closeNotebookPanel();
    dispatch(logout());
  };

  const MainMenu = (
    <Animated.View style={[settingPanelStyles.settingsDrawer, animateMainMenuDrawer]}>
      <MainMenuPanel
        closeMainMenuPanel={closeMainMenuPanel}
        logout={onLogout}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        openSpotInNotebook={openSpotInNotebook}
        updateSpotsInMapExtent={mapComponentRef.current?.updateSpotsInMapExtent}
        zoomToCenterOfflineTile={mapComponentRef.current?.zoomToCenterOfflineTile}
        zoomToCustomMap={mapComponentRef.current?.zoomToCustomMap}
      />
    </Animated.View>
  );

  return (
    <Animated.View style={[homeStyles.container, animateTextInputs]}>
      {SMALL_SCREEN ? (
        <HomeViewSmallScreen
          animateLeftSide={animateLeftSide}
          animatedValueLeftSide={animatedValueLeftSide}
          areEditButtonsVisible={buttons.editButtonsVisible}
          clickHandler={clickHandler}
          closeNotebookPanel={closeNotebookPanel}
          dialogClickHandler={dialogClickHandler}
          dialogs={dialogs}
          distance={distance}
          drawButtonsVisible={buttons.drawButtonsVisible}
          endMeasurement={endMeasurement}
          isMainMenuPanelVisible={isMainMenuPanelVisible}
          isSelectingForStereonet={isSelectingForStereonet}
          isSelectingForTagging={isSelectingForTagging}
          mapComponentRef={mapComponentRef}
          mapMode={mapMode}
          onEndDrawPressed={onEndDrawPressed}
          openMainMenuPanel={openMainMenuPanel}
          openNotebookPanel={openNotebookPanel}
          openSpotInNotebook={openSpotInNotebook}
          renderVersionCheckLabel={renderVersionCheckLabel()}
          setDistance={setDistance}
          showUpdateLabel={showUpdateLabel}
          startEdit={startEdit}
          toggleDialog={toggleDialog}
          toggleHomeDrawer={toggleHomeDrawerButton}
        />
      ) : (
        <HomeView
          animateLeftSide={animateLeftSide}
          animateNotebookDrawer={animateNotebookDrawer}
          animateRightSide={animateRightSide}
          areEditButtonsVisible={buttons.editButtonsVisible}
          clickHandler={clickHandler}
          closeNotebookPanel={closeNotebookPanel}
          dialogClickHandler={dialogClickHandler}
          dialogs={dialogs}
          distance={distance}
          drawButtonsVisible={buttons.drawButtonsVisible}
          endMeasurement={endMeasurement}
          isSelectingForStereonet={isSelectingForStereonet}
          isSelectingForTagging={isSelectingForTagging}
          mapComponentRef={mapComponentRef}
          mapMode={mapMode}
          onEndDrawPressed={onEndDrawPressed}
          openMainMenuPanel={openMainMenuPanel}
          openNotebookPanel={openNotebookPanel}
          setDistance={setDistance}
          startEdit={startEdit}
          toggleDialog={toggleDialog}
          toggleHomeDrawer={toggleHomeDrawerButton}
        />
      )}
      {/*Modals for Home Page*/}
      <BackupModal/>
      {/*<BackUpOverwriteModal onPress={action => useProject.switchProject(action)}/>*/}
      {isProjectLoadSelectionModalVisible && Platform.OS !== 'web' && (
        <InitialProjectLoadModal
          closeModal={closeInitialProjectLoadModal}
          logout={onLogout}
          openMainMenuPanel={openMainMenuPanel}
          visible={isProjectLoadSelectionModalVisible}
        />
      )}
      <ErrorModal/>
      <StatusModal
        exportProject={exportProject}
        openMainMenuPanel={openMainMenuPanel}
        openUrl={openStraboSpotURL}
      />
      <UploadModal toggleHomeDrawer={toggleHomeDrawerButton}/>
      <UploadProgressModal/>
      <WarningModal/>
      {/*------------------------*/}
      <LoadingSpinner isLoading={isHomeLoading}/>
      {MainMenu}
      {modalVisible && renderFloatingView()}
      {mapComponentRef.current && isOfflineMapModalVisible && <SaveMapsModal map={mapComponentRef.current}/>}
    </Animated.View>
  );
};

export default Home;
