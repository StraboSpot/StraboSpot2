import React from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {MAP_MODES} from '../maps/maps.constants';
import {MODALS} from './home.constants';
import homeStyles from './home.style';

const RightSideButtons = (props) => {
  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const isOnline = useSelector(state => state.home.isOnline);

  return (
    <React.Fragment>
      <Animated.View
        style={[homeStyles.notebookButton, props.rightsideIconAnimation]}>
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/NotebookViewButton_pressed.png')
            : require('../../assets/icons/NotebookViewButton.png')}
          onPress={() => props.toggleNotebookPanel()}
        />
        <IconButton
          source={isOnline ? online : offline}
        />
      </Animated.View>
      {!currentImageBasemap && (
        <Animated.View
          style={[homeStyles.shortcutButtons, props.rightsideIconAnimation]}>
          {shortcutSwitchPosition.Tag && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.TAGS
                ? require('../../assets/icons/TagButton_pressed.png')
                : require('../../assets/icons/TagButton.png')}
              onPress={() => props.clickHandler('tag')}
            />
          )}
          {shortcutSwitchPosition.Measurement && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.COMPASS
                ? require('../../assets/icons/MeasurementButton_pressed.png')
                : require('../../assets/icons/MeasurementButton.png')}
              onPress={() => props.clickHandler('measurement')}
            />
          )}
          {shortcutSwitchPosition.Sample && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE
                ? require('../../assets/icons/SampleButton_pressed.png')
                : require('../../assets/icons/SampleButton.png')}
              onPress={() => props.clickHandler('sample')}
            />
          )}
          {shortcutSwitchPosition.Note && (
            <IconButton
              name={'Note'}
              source={modalVisible === MODALS.SHORTCUT_MODALS.NOTES
                ? require('../../assets/icons/NoteButton_pressed.png')
                : require('../../assets/icons/NoteButton.png')}
              onPress={() => props.clickHandler('note')}
            />
          )}
          {shortcutSwitchPosition.Photo && (
            <IconButton
              source={require('../../assets/icons/PhotoButton.png')}
              onPress={() => props.clickHandler('photo')}
            />
          )}
          {shortcutSwitchPosition.Sketch && (
            <IconButton
              source={modalVisible === MODALS.SHORTCUT_MODALS.SKETCH
                ? require('../../assets/icons/Sketch_pressed.png')
                : require('../../assets/icons/SketchButton.png')
              }
              onPress={() => props.clickHandler('sketch')}
            />
          )}
        </Animated.View>
      )}
      {props.drawButtonsVisible && (
        <Animated.View
          style={[homeStyles.drawToolsContainer, props.rightsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={props.mapMode === MAP_MODES.DRAW.POINT
              ? require('../../assets/icons/PointButton_pressed.png')
              : require('../../assets/icons/PointButton.png')}
            onPress={() => props.clickHandler(MAP_MODES.DRAW.POINT)}
          />
          <IconButton
            style={{top: 5}}
            source={props.mapMode === MAP_MODES.DRAW.FREEHANDLINE
              ? require('../../assets/icons/LineFreehandButton_pressed.png')
              : (props.mapMode === MAP_MODES.DRAW.LINE
                ? require('../../assets/icons/LineButton_pressed.png')
                : require('../../assets/icons/LineButton.png'))}
            onPress={() => props.clickHandler(MAP_MODES.DRAW.LINE)}
            onLongPress={() => props.clickHandler(MAP_MODES.DRAW.FREEHANDLINE)}
          />
          <IconButton
            style={{top: 5}}
            source={props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
              ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
              : (props.mapMode === MAP_MODES.DRAW.POLYGON
                ? require('../../assets/icons/PolygonButton_pressed.png')
                : require('../../assets/icons/PolygonButton.png'))}
            onPress={() => props.clickHandler(MAP_MODES.DRAW.POLYGON)}
            onLongPress={() => props.clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON)}
          />
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default RightSideButtons;
