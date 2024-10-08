import React from 'react';
import {Animated} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {LeftSideButtons, RightSideButtons} from './buttons';
import DeviceInfo from './DeviceInfo';
import uiStyles from '../../shared/ui/ui.styles';
import Map from '../maps/Map';
import OfflineMapLabel from '../maps/offline-maps/OfflineMapsLabel';
import notebookStyles from '../notebook-panel/notebook.styles';
import NotebookPanel from '../notebook-panel/NotebookPanel';

const HomeView = ({
                    animateLeftSide,
                    animateNotebookDrawer,
                    animateRightSide,
                    areEditButtonsVisible,
                    clickHandler,
                    closeMainMenuPanel,
                    closeNotebookPanel,
                    dialogClickHandler,
                    dialogs,
                    distance,
                    drawButtonsVisible,
                    endMeasurement,
                    isSelectingForStereonet,
                    isSelectingForTagging,
                    mapComponentRef,
                    mapMode,
                    onEndDrawPressed,
                    openMainMenuPanel,
                    openNotebookPanel,
                    setDistance,
                    startEdit,
                    toggleDialog,
                  }) => {
  console.log('Rendering HomeView...');

  return (
    <SafeAreaView style={uiStyles.safeAreaView}>
      <Map
        onEndDrawPressed={onEndDrawPressed}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        mapComponentRef={mapComponentRef}
        mapMode={mapMode}
        setDistance={setDistance}
        startEdit={startEdit}
      />

      <DeviceInfo/>
      <OfflineMapLabel/>

      <RightSideButtons
        animateRightSide={animateRightSide}
        areEditButtonsVisible={areEditButtonsVisible}
        clickHandler={clickHandler}
        closeNotebookPanel={closeNotebookPanel}
        distance={distance}
        drawButtonsVisible={drawButtonsVisible}
        endMeasurement={endMeasurement}
        mapMode={mapMode}
        onEndDrawPressed={onEndDrawPressed}
        openNotebookPanel={openNotebookPanel}
      />

      <LeftSideButtons
        animateLeftSide={animateLeftSide}
        clickHandler={clickHandler}
        closeMainMenuPanel={closeMainMenuPanel}
        dialogClickHandler={dialogClickHandler}
        dialogs={dialogs}
        mapComponentRef={mapComponentRef}
        openMainMenuPanel={openMainMenuPanel}
        toggleDialog={toggleDialog}
      />

      <Animated.View style={[notebookStyles.notebookDrawer, animateNotebookDrawer]}>
        <NotebookPanel
          closeNotebookPanel={closeNotebookPanel}
          createDefaultGeom={mapComponentRef.current?.createDefaultGeom}
          openMainMenuPanel={openMainMenuPanel}
          zoomToSpots={mapComponentRef.current?.zoomToSpots}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeView;
