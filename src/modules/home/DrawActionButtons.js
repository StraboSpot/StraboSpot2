import React from 'react';
import {View} from 'react-native';

import IconButton from '../../shared/ui/IconButton';
import {MAP_MODES} from '../maps/maps.constants';
import homeStyles from './home.style';


const DrawActionButtons = ({clickHandler, changeDrawType, onLongPress, pointIconType}) => {

  return (
    <View style={homeStyles.drawToolsContainer}>
      <IconButton
        source={changeDrawType(MAP_MODES.DRAW.POINT)}
        onPress={() => {
          if (pointIconType.point === MAP_MODES.DRAW.POINT) clickHandler(MAP_MODES.DRAW.POINT);
          else clickHandler(MAP_MODES.DRAW.POINTLOCATION);
        }}
        onLongPress={() => onLongPress('point')}
      />
      <IconButton
        source={changeDrawType(MAP_MODES.DRAW.LINE)}
        onPress={() => {
          if (pointIconType.line === MAP_MODES.DRAW.LINE) clickHandler(MAP_MODES.DRAW.LINE);
          else clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
        }}
        onLongPress={() => onLongPress('line')}
      />
      <IconButton
        source={changeDrawType(MAP_MODES.DRAW.POLYGON)}
        onPress={() => {
          if (pointIconType.polygon === MAP_MODES.DRAW.POLYGON) clickHandler(MAP_MODES.DRAW.POLYGON);
          else clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
        }}
        onLongPress={() => onLongPress('polygon')}
      />
    </View>
  );
};

export default DrawActionButtons;
