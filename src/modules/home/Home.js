import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import {Platform} from 'react-native';

import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {setIsOfflineMapsModalVisible, setLoadingStatus} from './home.slice';
import HomeView from './HomeView';
import HomeViewSmallScreen from './HomeViewSmallScreen';
import useDeviceOrientation from './useDeviceOrientation';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import {MAP_MODES} from '../maps/maps.constants';
import useMapLocation from '../maps/useMapLocation';
import {PAGE_KEYS} from '../page/page.constants';
import useProject from '../project/useProject';
import {useSpots} from '../spots';
import {clearedSelectedSpots} from '../spots/spots.slice';

const Home = forwardRef(({
                           animatedValueLeftSide,
                           animatedValueNotebookDrawer,
                           animatedValueRightSide,
                           closeMainMenuPanel,
                           closeNotebookPanel,
                           openMainMenuPanel,
                           openNotebookPanel,
                           openSpotInNotebook,
                           zoomToCurrentLocation,
                         }, mapComponentRef) => {
  console.log('Rendering Home...');

  const {lockOrientation, unlockOrientation} = useDeviceOrientation();
  const {setPointAtCurrentLocation} = useMapLocation();
  const {getSelectedDatasetFromId} = useProject();
  const {getRootSpot, getSpotWithThisStratSection, handleSpotSelected} = useSpots();

  const dispatch = useDispatch();
  const toast = useToast();

  const [buttons, setButtons] = useState(
    {drawButtonsVisible: true, editButtonsVisible: false, userLocationButtonOn: false});
  const [dialogs, setDialogs] = useState(
    {mapActionsMenuVisible: false, mapSymbolsMenuVisible: false, baseMapMenuVisible: false});
  const [distance, setDistance] = useState(0);
  const [isSelectingForStereonet, setIsSelectingForStereonet] = useState(false);
  const [isSelectingForTagging, setIsSelectingForTagging] = useState(false);
  const [mapMode, setMapMode] = useState(MAP_MODES.VIEW);

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const stratSection = useSelector(state => state.map.stratSection);

  const animateLeftSide = useMemo(() => ({transform: [{translateX: animatedValueLeftSide}]}),
    [animatedValueLeftSide]);
  const animateNotebookDrawer = {transform: [{translateX: animatedValueNotebookDrawer}]};
  const animateRightSide = {transform: [{translateX: animatedValueRightSide}]};

  useEffect(() => {
    // console.log('UE Home [mapMode]', mapMode);
    if (mapMode !== MAP_MODES.DRAW.MEASURE) mapComponentRef.current?.endMapMeasurement();
  }, [mapMode]);

  const cancelEdits = async () => {
    await mapComponentRef.current?.cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    unlockOrientation();
  };

  const clickHandler = async (name, value) => {
    switch (name) {
      // Map Actions
      case MAP_MODES.DRAW.POINT:
      case MAP_MODES.DRAW.LINE:
      case MAP_MODES.DRAW.POLYGON:
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
      case MAP_MODES.DRAW.FREEHANDLINE:
      case MAP_MODES.DRAW.POINTLOCATION:
        dispatch(clearedSelectedSpots());
        const selectedDataset = getSelectedDatasetFromId();
        if (!isEmpty(selectedDataset) && name === MAP_MODES.DRAW.POINTLOCATION) await createPointAtCurrentLocation();
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
        if (value) zoomToCurrentLocation().catch(console.error);
        mapComponentRef.current?.toggleUserLocation(value);
        break;
      case 'closeImageBasemap':
        const spotWithThisImageBasemap = getRootSpot(currentImageBasemap?.id);
        handleSpotSelected(spotWithThisImageBasemap);
        break;
      case 'closeStratSection':
        const spotWithThisStratSection = getSpotWithThisStratSection(stratSection?.strat_section_id);
        handleSpotSelected(spotWithThisStratSection);
        break;
      // Map Actions
      case 'zoom':
        mapComponentRef.current?.zoomToSpotsExtent();
        break;
      case 'saveMap':
        dispatch(setIsOfflineMapsModalVisible(!isOfflineMapModalVisible));
        closeMainMenuPanel();
        break;
      case 'addTag':
        // console.log(`${name}`, ' was clicked');
        mapComponentRef.current?.clearSelectedSpots();
        setIsSelectingForTagging(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        if (Platform.OS === 'ios') setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        else setDraw(MAP_MODES.DRAW.POLYGON).catch(console.error);
        break;
      case 'stereonet':
        // console.log(`${name}`, ' was clicked');
        mapComponentRef.current?.clearSelectedSpots();
        setIsSelectingForStereonet(true);
        setDraw(MAP_MODES.DRAW.FREEHANDPOLYGON).catch(console.error);
        break;
      case 'mapMeasurement':
        setDraw(MAP_MODES.DRAW.MEASURE).catch(console.error);
        break;
      case 'stratSection':
        const selectedSpotWithThisStratSection = getSpotWithThisStratSection(stratSection?.strat_section_id);
        handleSpotSelected(selectedSpotWithThisStratSection);
        openNotebookPanel(PAGE_KEYS.STRAT_SECTION);
        break;
    }
  };

  const createPointAtCurrentLocation = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      await setPointAtCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show(`Point Spot Added at Current\n Location to Dataset ${getSelectedDatasetFromId().name.toUpperCase()}`,
        {type: 'success'});
      openNotebookPanel();
    }
    catch (err) {
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      console.error('Error setting point to current location', err);
    }
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endMeasurement = () => setMapMode(MAP_MODES.VIEW);

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

  const saveEdits = async () => {
    mapComponentRef.current?.saveEdits();
    //cancelEdits();
    setMapMode(MAP_MODES.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    unlockOrientation();
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
    lockOrientation();
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

  if (SMALL_SCREEN) {
    return (
      <HomeViewSmallScreen
        animateLeftSide={animateLeftSide}
        animatedValueLeftSide={animatedValueLeftSide}
        areEditButtonsVisible={buttons.editButtonsVisible}
        clickHandler={clickHandler}
        closeMainMenuPanel={closeMainMenuPanel}
        closeNotebookPanel={closeNotebookPanel}
        dialogClickHandler={dialogClickHandler}
        dialogs={dialogs}
        distance={distance}
        drawButtonsVisible={buttons.drawButtonsVisible}
        endMeasurement={endMeasurement}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        mapMode={mapMode}
        onEndDrawPressed={onEndDrawPressed}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        openSpotInNotebook={openSpotInNotebook}
        ref={mapComponentRef}
        setDistance={setDistance}
        setMapModeToEdit={setMapModeToEdit}
        toggleDialog={toggleDialog}
      />
    );
  }
  else {
    return (
      <HomeView
        animateLeftSide={animateLeftSide}
        animateNotebookDrawer={animateNotebookDrawer}
        animateRightSide={animateRightSide}
        areEditButtonsVisible={buttons.editButtonsVisible}
        clickHandler={clickHandler}
        closeMainMenuPanel={closeMainMenuPanel}
        closeNotebookPanel={closeNotebookPanel}
        dialogClickHandler={dialogClickHandler}
        dialogs={dialogs}
        distance={distance}
        drawButtonsVisible={buttons.drawButtonsVisible}
        endMeasurement={endMeasurement}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        mapMode={mapMode}
        onEndDrawPressed={onEndDrawPressed}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        ref={mapComponentRef}
        setDistance={setDistance}
        setMapModeToEdit={setMapModeToEdit}
        toggleDialog={toggleDialog}
      />
    );
  }
});

export default Home;
