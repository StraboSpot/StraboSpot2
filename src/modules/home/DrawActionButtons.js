import React, {useState} from 'react';
import {View} from 'react-native';

import IconButton from '../../shared/ui/IconButton';
import {MAP_MODES} from '../maps/maps.constants';
import homeStyles from './home.style';
import useHomeHook from './useHome';

const DrawActionButtons = ({clickHandler, mapMode}) => {

  const useHome = useHomeHook();

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  return (
    <View style={homeStyles.drawToolsContainer}>
      <IconButton
        source={useHome.changeDrawType(MAP_MODES.DRAW.POINT, mapMode)}
        onPress={() => {
          if (pointIconType.point === MAP_MODES.DRAW.POINT) clickHandler(MAP_MODES.DRAW.POINT);
          else clickHandler(MAP_MODES.DRAW.POINTLOCATION);
        }}
        onLongPress={() => useHome.onLongPress('point')}
      />
      <IconButton
        source={useHome.changeDrawType(MAP_MODES.DRAW.LINE, mapMode)}
        onPress={() => {
          if (pointIconType.line === MAP_MODES.DRAW.LINE) clickHandler(MAP_MODES.DRAW.LINE);
          else clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
        }}
        onLongPress={() => useHome.onLongPress('line')}
      />
      <IconButton
        source={useHome.changeDrawType(MAP_MODES.DRAW.POLYGON, mapMode)}
        onPress={() => {
          if (pointIconType.polygon === MAP_MODES.DRAW.POLYGON) clickHandler(MAP_MODES.DRAW.POLYGON);
          else clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
        }}
        onLongPress={() => useHome.onLongPress('polygon')}
      />
    </View>
  );
};

export default DrawActionButtons;
