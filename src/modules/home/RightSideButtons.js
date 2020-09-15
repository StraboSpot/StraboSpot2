import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {MapModes} from '../maps/maps.constants';
import {Modals} from './home.constants';
import homeStyles from './home.style';

const RightSideButtons = (props) => {

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);

  return (
    <React.Fragment>
      <View style={homeStyles.noteBookButton}>
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/NotebookViewButton_pressed.png')
            : require('../../assets/icons/NotebookViewButton.png')}
          onPress={() => props.toggleNotebookPanel()}
        />
      </View>
      {!currentImageBasemap && <View style={homeStyles.shortcutButtons}>
        {shortcutSwitchPosition.Tag && <IconButton
          source={modalVisible === Modals.SHORTCUT_MODALS.TAGS
            ? require('../../assets/icons/TagButton_pressed.png')
            : require('../../assets/icons/TagButton.png')}
          onPress={() => props.clickHandler('tag')}
        />}
        {shortcutSwitchPosition.Measurement && <IconButton
          source={modalVisible === Modals.SHORTCUT_MODALS.COMPASS
            ? require('../../assets/icons/MeasurementButton_pressed.png')
            : require('../../assets/icons/MeasurementButton.png')}
          onPress={() => props.clickHandler('measurement')}
        />
        }
        {shortcutSwitchPosition.Sample && <IconButton
          source={modalVisible === Modals.SHORTCUT_MODALS.SAMPLE
            ? require('../../assets/icons/SampleButton_pressed.png')
            : require('../../assets/icons/SampleButton.png')}
          onPress={() => props.clickHandler('sample')}
        />}
        {shortcutSwitchPosition.Note && <IconButton
          name={'Note'}
          source={modalVisible === Modals.SHORTCUT_MODALS.NOTES
            ? require('../../assets/icons/NoteButton_pressed.png')
            : require('../../assets/icons/NoteButton.png')}
          onPress={() => props.clickHandler('note')}
        />}
        {shortcutSwitchPosition.Photo && <IconButton
          source={require('../../assets/icons/PhotoButton.png')}
          onPress={() => props.clickHandler('photo')}
        />}
        {shortcutSwitchPosition.Sketch && <IconButton
          source={require('../../assets/icons/SketchButton.png')}
          onPress={() => props.clickHandler('sketch')}
        />}
      </View>}
      {props.drawButtonsVisible && <View style={homeStyles.drawToolsContainer}>
        <IconButton
          style={{top: 5}}
          source={props.mapMode === MapModes.DRAW.POINT
            ? require('../../assets/icons/PointButton_pressed.png')
            : require('../../assets/icons/PointButton.png')}
          onPress={() => props.clickHandler(MapModes.DRAW.POINT)}
        />
        <IconButton
          style={{top: 5}}
          source={props.mapMode === MapModes.DRAW.FREEHANDLINE ? require(
            '../../assets/icons/LineButton_pressed_copy.png')
            : (props.mapMode === MapModes.DRAW.LINE
              ? require('../../assets/icons/LineButton_pressed.png')
              : require('../../assets/icons/LineButton.png'))}
          onPress={() => props.clickHandler(MapModes.DRAW.LINE)}
          onLongPress={() => props.clickHandler(MapModes.DRAW.FREEHANDLINE)}
        />
        <IconButton
          style={{top: 5}}
          source={props.mapMode === MapModes.DRAW.FREEHANDPOLYGON ? require(
            '../../assets/icons/PolygonFreehandButton_pressed.png')
            : (props.mapMode === MapModes.DRAW.POLYGON
              ? require('../../assets/icons/PolygonButton_pressed.png')
              : require('../../assets/icons/PolygonButton.png'))}
          onPress={() => props.clickHandler(MapModes.DRAW.POLYGON)}
          onLongPress={() => props.clickHandler(MapModes.DRAW.FREEHANDPOLYGON)}
        />
      </View>}
    </React.Fragment>
  );
};

export default RightSideButtons;
