import React from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import Map from '../maps/Map';
import {MAP_MODES} from '../maps/maps.constants';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import LeftSideButtons from './LeftSideButtons';
import RightSideButtons from './RightSideButtons';
import StatusBar from './StatusBar';

const HomeView = ({
                    animation,
                    buttons,
                    clickHandler,
                    closeNotebookPanel,
                    dialogClickHandler,
                    distance,
                    endDraw,
                    isSelectingForStereonet,
                    isSelectingForTagging,
                    leftsideIconAnimationValue,
                    mapComponentRef,
                    mapMode,
                    openNotebookPanel,
                    rightsideIconAnimationValue,
                    setDistance,
                    setMapMode,
                    startEdit,
                    toast,
                    toggleHomeDrawer,
                  }) => {
  console.log('Rendering HomeView...');

  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};

  const toggleNotebookPanel = () => {
    if (isNotebookPanelVisible) closeNotebookPanel();
    else openNotebookPanel();
  };

  const renderNotebookPanel = () => {
    return (
      <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
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
        clickHandler={clickHandler}
        closeNotebookPanel={closeNotebookPanel}
        distance={distance}
        drawButtonsVisible={buttons.drawButtonsVisible}
        endDraw={endDraw}
        endMeasurement={() => setMapMode(MAP_MODES.VIEW)}
        mapMode={mapMode}
        openNotebookPanel={openNotebookPanel}
        rightsideIconAnimation={rightsideIconAnimation}
        toggleNotebookPanel={toggleNotebookPanel}
      />
      <LeftSideButtons
        // rightsideIconAnimation={rightsideIconAnimation}
        clickHandler={clickHandler}
        dialogClickHandler={dialogClickHandler}
        leftsideIconAnimation={leftsideIconAnimation}
        toast={message => toast.show(message, {type: 'warning'})}
        toggleHomeDrawer={toggleHomeDrawer}
        zoomToCenterOfflineTile={() => mapComponentRef.current?.zoomToCenterOfflineTile()}
        zoomToCustomMap={(bbox, duration) => mapComponentRef.current?.zoomToCustomMap(bbox, duration)}
      />
      {renderNotebookPanel()}
    </>
  );
};

export default HomeView;
