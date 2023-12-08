import React from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {MODAL_KEYS} from '../page/page.constants';
import DrawActionButtons from './DrawActionButtons';
import DrawInfo from './DrawInfo';
import {setModalVisible} from './home.slice';
import homeStyles from './home.style';
import ShortcutButtons from './ShortcutButtons';

const RightSideButtons = ({
                            clickHandler,
                            distance,
                            drawButtonsVisible,
                            endDraw,
                            endMeasurement,
                            mapMode,
                            openNotebookPanel,
                            toggleNotebookPanel,
                          }) => {
  console.log('Rendering RightSideButtons...');

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      {stratSection && (
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/AddIntervalButton_pressed.png')
            : require('../../assets/icons/AddIntervalButton.png')}
          onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.ADD_INTERVAL}))}
          style={homeStyles.addIntervalButton}
        />
      )}

      <IconButton
        source={isNotebookPanelVisible
          ? require('../../assets/icons/NotebookViewButton_pressed.png')
          : require('../../assets/icons/NotebookViewButton.png')}
        onPress={toggleNotebookPanel}
        style={homeStyles.notebookButton}
      />

      {!currentImageBasemap && !stratSection && !isNotebookPanelVisible && (
        <ShortcutButtons openNotebookPanel={openNotebookPanel}/>
      )}

      {drawButtonsVisible && (
        <View style={homeStyles.drawContainer}>
          <DrawInfo
            distance={distance}
            endDraw={endDraw}
            endMeasurement={endMeasurement}
            mapMode={mapMode}
          />
          <DrawActionButtons
            clickHandler={clickHandler}
            mapMode={mapMode}
          />
        </View>
      )}
    </>
  );
};

export default RightSideButtons;
