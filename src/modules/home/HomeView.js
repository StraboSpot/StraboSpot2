import React from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import Map from '../maps/Map';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import StatusBar from './StatusBar';

const HomeView = ({
                    animateLeftSide,
                    animateNotebookDrawer,
                    animateRightSide,
                    clickHandler,
                    closeNotebookPanel,
                    dialogClickHandler,
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
                    toggleHomeDrawer,
                  }) => {
  console.log('Rendering HomeView...');

  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);

  const toggleNotebookPanel = () => {
    if (isNotebookPanelVisible) closeNotebookPanel();
    else openNotebookPanel();
  };

  const renderNotebookPanel = () => {
    return (
      <Animated.View style={[notebookStyles.panel, animateNotebookDrawer]}>
        <NotebookPanel
          closeNotebookPanel={closeNotebookPanel}
          createDefaultGeom={mapComponentRef.current?.createDefaultGeom}
          openMainMenu={toggleHomeDrawer}
          zoomToSpot={mapComponentRef.current?.zoomToSpot}
        />
      </Animated.View>
    );
  };

  return (
    <>
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
      <RightSideButtons
        animateRightSide={animateRightSide}
        clickHandler={clickHandler}
        distance={distance}
        drawButtonsVisible={drawButtonsVisible}
        endDraw={endDraw}
        endMeasurement={endMeasurement}
        mapMode={mapMode}
        openNotebookPanel={openNotebookPanel}
        toggleNotebookPanel={toggleNotebookPanel}
      />
      <LeftSideButtons
        animateLeftSide={animateLeftSide}
        clickHandler={clickHandler}
        dialogClickHandler={dialogClickHandler}
        mapComponentRef={mapComponentRef}
        toggleHomeDrawer={toggleHomeDrawer}
      />
      {renderNotebookPanel()}
    </>
  );
};

export default HomeView;
