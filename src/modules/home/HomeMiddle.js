import React, {useEffect, useRef, useState} from 'react';
import {Animated, Platform, View} from 'react-native';

import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {setLoadingStatus, setModalVisible, setOfflineMapsModalVisible, setProjectLoadComplete} from './home.slice';
import homeStyles from './home.style';
import HomeView from './HomeView';
import HomeViewSmallScreen from './HomeViewSmallScreen';
import useHomeHook from './useHome';
import VersionCheckLabel from '../../services/versionCheck/VersionCheckLabel';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import {MAP_MODES} from '../maps/maps.constants';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';
import useMapLocationHook from '../maps/useMapLocation';
import {MODAL_KEYS, MODALS, PAGE_KEYS} from '../page/page.constants';
import useProjectHook from '../project/useProject';
import {clearedSelectedSpots, setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const HomeMiddle = ({
                 animatedValueRightSide,
                 animatedValueNotebookDrawer,
                 animatedValueMainMenuDrawer,
                 animatedValueLeftSide,
                 closeNotebookPanel,
                 dialogs,
                 isMainMenuPanelVisible,
                 onLogout,
                 openNotebookPanel,
                 showUpdateLabel,
                 toggleDialog,
                 toggleHomeDrawerButton,
               }) => {
  console.log('Rendering HomeMiddle...');
  const toast = useToast();
  const useHome = useHomeHook();
  const useMapLocation = useMapLocationHook();
  const useProject = useProjectHook();
  const useSpots = useSpotsHook();

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const stratSection = useSelector(state => state.map.stratSection);

  const mapComponentRef = useRef(null);

  const [buttons, setButtons] = useState(
    {drawButtonsVisible: true, editButtonsVisible: false, userLocationButtonOn: false});
  const [distance, setDistance] = useState(0);
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);

  const animateLeftSide = {transform: [{translateX: animatedValueLeftSide}]};
  const animateMainMenuDrawer = {transform: [{translateX: animatedValueMainMenuDrawer}]};
  const animateNotebookDrawer = {transform: [{translateX: animatedValueNotebookDrawer}]};
  const animateRightSide = {transform: [{translateX: animatedValueRightSide}]};

  const selectedDataset = useProject.getSelectedDatasetFromId();

  useEffect(() => {
    console.log('UE Home [mapMode]', mapMode);
    if (mapMode !== MAP_MODES.DRAW.MEASURE) mapComponentRef.current?.endMapMeasurement();
  }, [mapMode]);

  useEffect(() => {
    console.log('UE Home [projectLoadComplete]', projectLoadComplete);
    if (projectLoadComplete) {
      mapComponentRef.current?.zoomToSpotsExtent();
      dispatch(setProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

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
        dispatch(setOfflineMapsModalVisible(!isOfflineMapModalVisible));
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

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endMeasurement = () => setMapMode(MAP_MODES.VIEW);

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

  const openSpotInNotebook = (spot, notebookPage, attributes) => {
    useSpots.handleSpotSelected(spot);
    if (attributes) dispatch(setSelectedAttributes(attributes));
    if (notebookPage) openNotebookPanel(notebookPage);
    else openNotebookPanel(PAGE_KEYS.OVERVIEW);
  };

  const renderFloatingView = () => {
    const modal = MODALS.find(m => m.key === modalVisible);
    if (modal?.modal_component) {
      const ModalDisplayed = modal.modal_component;
      if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
        return (
          <ModalDisplayed
            goToCurrentLocation={goToCurrentLocation}
            modalKey={modal.key}
            onPress={modalHandler}
          />
        );
      }
      else return <ModalDisplayed modalKey={modal.key} onPress={modalHandler}/>;
    }
  };

  const renderMainMenu = () => {
    return (
      <Animated.View style={[settingPanelStyles.settingsDrawer, animateMainMenuDrawer]}>
        <MainMenuPanel
          closeMainMenuPanel={toggleHomeDrawerButton}
          logout={onLogout}
          openNotebookPanel={openNotebookPanel}
          openSpotInNotebook={openSpotInNotebook}
          updateSpotsInMapExtent={mapComponentRef.current?.updateSpotsInMapExtent}
          zoomToCenterOfflineTile={mapComponentRef.current?.zoomToCenterOfflineTile}
          zoomToCustomMap={mapComponentRef.current?.zoomToCustomMap}
        />
      </Animated.View>
    );
  };

  const renderVersionCheckLabel = () => (
    <View style={homeStyles.versionPositionHome}>
      <VersionCheckLabel/>
    </View>
  );

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

  const setDraw = async (mapModeToSet) => {
    mapComponentRef.current?.cancelDraw();
    if (mapMode === mapModeToSet
      || (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON && mapModeToSet === MAP_MODES.DRAW.POLYGON)
      || (mapMode === MAP_MODES.DRAW.FREEHANDLINE && mapModeToSet === MAP_MODES.DRAW.LINE)
    ) mapModeToSet = MAP_MODES.VIEW;
    setMapMode(mapModeToSet);
  };

  const setMapModeToEdit = () => {
    useHome.lockOrientation();
    setMapMode(MAP_MODES.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
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

  return (
    <>
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
          openNotebookPanel={openNotebookPanel}
          openSpotInNotebook={openSpotInNotebook}
          renderVersionCheckLabel={renderVersionCheckLabel()}
          setDistance={setDistance}
          setMapModeToEdit={setMapModeToEdit}
          showUpdateLabel={showUpdateLabel}
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
          openNotebookPanel={openNotebookPanel}
          setDistance={setDistance}
          setMapModeToEdit={setMapModeToEdit}
          toggleDialog={toggleDialog}
          toggleHomeDrawer={toggleHomeDrawerButton}
        />
      )}
      {renderMainMenu()}
      {modalVisible && renderFloatingView()}
      {mapComponentRef.current && isOfflineMapModalVisible && <SaveMapsModal map={mapComponentRef.current}/>}
    </>
  );
};

export default HomeMiddle;
