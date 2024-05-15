import React from 'react';
import {Animated, Text, View} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {LeftSideButtons, RightSideButtons} from './buttons';
import DeviceInfo from './DeviceInfo';
import uiStyles from '../../shared/ui/ui.styles';
import Map from '../maps/Map';
import OfflineMapLabel from '../maps/offline-maps/OfflineMapsLabel';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';

const HomeView = ({
                    animateLeftSide,
                    animateNotebookDrawer,
                    animateRightSide,
                    areEditButtonsVisible,
                    cameraRef,
                    clickHandler,
                    closeNotebookPanel,
                    dialogClickHandler,
                    dialogs,
                    distance,
                    drawButtonsVisible,
                    endMeasurement,
                    isSelectingForStereonet,
                    isSelectingForTagging,
                    mapComponentRef,
                    mapRef,
                    mapMode,
                    onEndDrawPressed,
                    openNotebookPanel,
                    setDistance,
                    setMapModeToEdit,
                    toggleDialog,
                    toggleHomeDrawer,
                  }) => {
  console.log('Rendering HomeView...');

  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);

  const toggleNotebookPanel = () => {
    if (isNotebookPanelVisible) closeNotebookPanel();
    else openNotebookPanel();
  };

  return (
    <>
      <Map
        cameraRef={cameraRef}
        onEndDrawPressed={onEndDrawPressed}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        mapComponentRef={mapComponentRef}
        mapRef={mapRef}
        mapMode={mapMode}
        setDistance={setDistance}
        setMapModeToEdit={setMapModeToEdit}
      />

      <DeviceInfo/>
      <OfflineMapLabel/>

      <RightSideButtons
        animateRightSide={animateRightSide}
        areEditButtonsVisible={areEditButtonsVisible}
        clickHandler={clickHandler}
        distance={distance}
        drawButtonsVisible={drawButtonsVisible}
        endMeasurement={endMeasurement}
        mapMode={mapMode}
        onEndDrawPressed={onEndDrawPressed}
        openNotebookPanel={openNotebookPanel}
        toggleNotebookPanel={toggleNotebookPanel}
      />

      <LeftSideButtons
        animateLeftSide={animateLeftSide}
        clickHandler={clickHandler}
        dialogClickHandler={dialogClickHandler}
        dialogs={dialogs}
        mapComponentRef={mapComponentRef}
        mapRef={mapRef}
        toggleDialog={toggleDialog}
        toggleHomeDrawer={toggleHomeDrawer}
      />

      {/*<Animated.View style={[notebookStyles.notebookDrawer, animateNotebookDrawer]}>*/}
      {/*  <NotebookPanel*/}
      {/*    closeNotebookPanel={closeNotebookPanel}*/}
      {/*    createDefaultGeom={mapComponentRef.current?.createDefaultGeom}*/}
      {/*    openMainMenu={toggleHomeDrawer}*/}
      {/*    zoomToSpots={mapComponentRef.current?.zoomToSpots}*/}
      {/*  />*/}
      {/*</Animated.View>*/}
    </>
  );
};

export default HomeView;
