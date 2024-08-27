import React from 'react';
import {Animated} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {DrawActionButtons, EditCancelSaveButtons, ShortcutButtons} from './index';
import NotebookButton from './NotebookButton';
import IconButton from '../../../shared/ui/IconButton';
import {MODAL_KEYS} from '../../page/page.constants';
import {setModalVisible} from '../home.slice';
import homeStyles from '../home.style';
import DrawInfo from '../pop-ups/DrawInfo';

const RightSideButtons = ({
                            animateRightSide,
                            areEditButtonsVisible,
                            clickHandler,
                            closeNotebookPanel,
                            distance,
                            drawButtonsVisible,
                            endMeasurement,
                            mapMode,
                            onEndDrawPressed,
                            openNotebookPanel,
                          }) => {
  console.log('Rendering RightSideButtons...');

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      {stratSection && (
        <Animated.View style={[homeStyles.addIntervalButton, animateRightSide]}>
          <IconButton
            source={modalVisible === MODAL_KEYS.OTHER.ADD_INTERVAL
              ? require('../../../assets/icons/AddIntervalButton_pressed.png')
              : require('../../../assets/icons/AddIntervalButton.png')}
            onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.ADD_INTERVAL}))}
          />
        </Animated.View>
      )}

      <Animated.View style={[homeStyles.notebookButton, animateRightSide]}>
        <NotebookButton closeNotebookPanel={closeNotebookPanel} openNotebookPanel={openNotebookPanel}/>
      </Animated.View>

      {!currentImageBasemap && !stratSection && (
        <Animated.View style={[homeStyles.shortcutButtons, animateRightSide]}>
          <ShortcutButtons openNotebookPanel={openNotebookPanel}/>
        </Animated.View>
      )}

      {drawButtonsVisible && (
        <Animated.View style={[homeStyles.drawContainer, animateRightSide]}>
          <DrawInfo
            distance={distance}
            endMeasurement={endMeasurement}
            mapMode={mapMode}
            onEndDrawPressed={onEndDrawPressed}
          />
          <DrawActionButtons
            clickHandler={clickHandler}
            mapMode={mapMode}
          />
        </Animated.View>
      )}

      {areEditButtonsVisible && (
        <Animated.View style={[homeStyles.editButtonsContainer, animateRightSide]}>
          <EditCancelSaveButtons clickHandler={clickHandler}/>
        </Animated.View>
      )}
    </>
  );
};

export default RightSideButtons;
