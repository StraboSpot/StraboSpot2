import React from 'react';
import {Animated} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import StatusBar from './StatusBar';
import uiStyles from '../../shared/ui/ui.styles';
import Map from '../maps/Map';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';

const HomeView = ({
                    animateLeftSide,
                    animateNotebookDrawer,
                    animateRightSide,
                    areEditButtonsVisible,
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
                    mapMode,
                    onEndDrawPressed,
                    openNotebookPanel,
                    setDistance,
                    startEdit,
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

      <StatusBar/>

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
        toggleDialog={toggleDialog}
        toggleHomeDrawer={toggleHomeDrawer}
      />

      <Animated.View style={[notebookStyles.notebookDrawer, animateNotebookDrawer]}>
        <NotebookPanel
          closeNotebookPanel={closeNotebookPanel}
          createDefaultGeom={mapComponentRef.current?.createDefaultGeom}
          openMainMenu={toggleHomeDrawer}
          zoomToSpot={mapComponentRef.current?.zoomToSpot}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeView;
