import {useState} from 'react';
import {Platform} from 'react-native';

import {MAP_MODES} from '../maps/maps.constants';
import {SMALL_SCREEN} from '../../shared/styles.constants';

const useHome = () => {

  const [drawTypes, setDrawTypes] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  const changeDrawType = (name, mapMode) => {
    switch (drawTypes[name]) {
      case MAP_MODES.DRAW.POINT:
        return mapMode === MAP_MODES.DRAW.POINT
          ? require('../../assets/icons/PointButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/PointButton_Transparent.png')
            : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/PointButtonCurrentLocation_Transparent.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return mapMode === MAP_MODES.DRAW.LINE
          ? require('../../assets/icons/LineButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Line_Transparent.png')
            : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? require('../../assets/icons/LineFreehandButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/LineFreehand_Transparent.png')
            : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return mapMode === MAP_MODES.DRAW.POLYGON
          ? require('../../assets/icons/PolygonButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Polygon_Transparent.png')
            : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/PolygonFreehand_Transparent.png')
            : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  const getDrawTypes = ()=> drawTypes;

  const onLongPress = (type) => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'point':
          setDrawTypes(prevState => ({
              ...prevState,
              point: drawTypes.point === MAP_MODES.DRAW.POINT
                ? MAP_MODES.DRAW.POINTLOCATION
                : MAP_MODES.DRAW.POINT,
            }),
          );
          break;
        case 'line':
          setDrawTypes(prevState => ({
              ...prevState,
              line: drawTypes.line === MAP_MODES.DRAW.LINE
                ? MAP_MODES.DRAW.FREEHANDLINE
                : MAP_MODES.DRAW.LINE,
            }),
          );
          break;
        case 'polygon':
          setDrawTypes(prevState => ({
              ...prevState,
              polygon: drawTypes.polygon === MAP_MODES.DRAW.POLYGON
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
    getDrawTypes: getDrawTypes,
    onLongPress: onLongPress,
  };
};

export default useHome;
