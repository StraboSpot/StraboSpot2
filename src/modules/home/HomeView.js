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
                    clickHandler,
                    closeNotebookPanel,
                    dialogClickHandler,
                    dialogs,
                    distance,
                    drawButtonsVisible,
                    endDraw,
                    endMeasurement,
                    isSelectingForStereonet,
                    isSelectingForTagging,
                    mapComponentRef,
                    mapMode,
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
        endDraw={endDraw}
        isSelectingForStereonet={isSelectingForStereonet}
        isSelectingForTagging={isSelectingForTagging}
        mapComponentRef={mapComponentRef}
        mapMode={mapMode}
        setDistance={setDistance}
        startEdit={startEdit}
      />

      <StatusBar/>

      <Animated.View style={[{position: 'absolute', height: '100%', right: 0}, animateRightSide]}>
        <RightSideButtons
          clickHandler={clickHandler}
          distance={distance}
          drawButtonsVisible={drawButtonsVisible}
          endDraw={endDraw}
          endMeasurement={endMeasurement}
          mapMode={mapMode}
          openNotebookPanel={openNotebookPanel}
          toggleNotebookPanel={toggleNotebookPanel}
        />
      </Animated.View>

      <Animated.View style={[{position: 'absolute', height: '100%', left: 0}, animateLeftSide]}>
        <LeftSideButtons
          clickHandler={clickHandler}
          dialogClickHandler={dialogClickHandler}
          dialogs={dialogs}
          mapComponentRef={mapComponentRef}
          toggleHomeDrawer={toggleHomeDrawer}
          toggleDialog={toggleDialog}
        />
      </Animated.View>

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