import {useState} from 'react';

import {MAP_MODES} from '../maps/maps.constants';
import {Platform} from 'react-native';

const useHome = () => {

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  const changeDrawType = (name, mapMode) => {
    switch (pointIconType[name]) {
      case MAP_MODES.DRAW.POINT:
        return mapMode === MAP_MODES.DRAW.POINT
          ? require('../../assets/icons/PointButton_pressed.png')
          : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return mapMode === MAP_MODES.DRAW.LINE
          ? require('../../assets/icons/LineButton_pressed.png')
          : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? require('../../assets/icons/LineFreehandButton_pressed.png')
          : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return mapMode === MAP_MODES.DRAW.POLYGON
          ? require('../../assets/icons/PolygonButton_pressed.png')
          : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  const onLongPress = (type) => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'point':
          setPointIconType(prevState => ({
              ...prevState,
              point: pointIconType.point === MAP_MODES.DRAW.POINT
                ? MAP_MODES.DRAW.POINTLOCATION
                : MAP_MODES.DRAW.POINT,
            }),
          );
          break;
        case 'line':
          setPointIconType(prevState => ({
              ...prevState,
              line: pointIconType.line === MAP_MODES.DRAW.LINE
                ? MAP_MODES.DRAW.FREEHANDLINE
                : MAP_MODES.DRAW.LINE,
            }),
          );
          break;
        case 'polygon':
          setPointIconType(prevState => ({
              ...prevState,
              polygon: pointIconType.polygon === MAP_MODES.DRAW.POLYGON
                ? MAP_MODES.DRAW.FREEHANDPOLYGON
                : MAP_MODES.DRAW.POLYGON,
            }),
          );
          break;
      }
    }
  };

  return {
    changeDrawType: changeDrawType,
    onLongPress: onLongPress,
  };
};

export default useHome;
