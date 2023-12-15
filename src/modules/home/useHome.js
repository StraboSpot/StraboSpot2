import {useState} from 'react';
import {Platform} from 'react-native';

import Orientation, {PORTRAIT, PORTRAIT_UPSIDE_DOWN, useDeviceOrientationChange} from 'react-native-orientation-locker';
import {useToast} from 'react-native-toast-notifications';

import {SMALL_SCREEN} from '../../shared/styles.constants';
import {MAP_MODES} from '../maps/maps.constants';


const useHome = () => {
  const [drawTypes, setDrawTypes] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });
  const [orientation, setOrientation] = useState(null);

  const toast = useToast();

  const changeDrawType = (name, mapMode) => {
    switch (drawTypes[name]) {
      case MAP_MODES.DRAW.POINT:
        return mapMode === MAP_MODES.DRAW.POINT
          ? SMALL_SCREEN ? require('../../assets/icons/Point_pressed_1.png')
            : require('../../assets/icons/PointButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Point.png')
            : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? SMALL_SCREEN ? require('../../assets/icons/PointCurrentLocation_pressed.png')
            : require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/PointCurrentLocation.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return mapMode === MAP_MODES.DRAW.LINE
          ? SMALL_SCREEN ? require('../../assets/icons/Line_pressed_1.png')
            : require('../../assets/icons/LineButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Line.png')
            : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? SMALL_SCREEN ? require('../../assets/icons/LineFreehand_pressed.png')
            : require('../../assets/icons/LineFreehandButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/LineFreehand.png')
            : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return mapMode === MAP_MODES.DRAW.POLYGON
          ? SMALL_SCREEN ? require('../../assets/icons/Polygon_pressed_1.png')
            : require('../../assets/icons/PolygonButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Polygon.png')
            : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? SMALL_SCREEN ? require('../../assets/icons/PolygonFreehand_pressed.png')
            : require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/PolygonFreehand.png')
            : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  const getDrawTypes = ()=> drawTypes;

  const lockOrientation = () => {
    console.log('Orientation', orientation);
    if (orientation === PORTRAIT || orientation === PORTRAIT_UPSIDE_DOWN) Orientation.lockToPortrait();
    else Orientation.lockToLandscape();
    toast.show('Screen orientation LOCKED in EDIT mode');
  };

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

  const unlockOrientation = () => {
    Orientation.unlockAllOrientations();
    toast.show('Screen orientation UNLOCKED');
  };

  useDeviceOrientationChange((o) => {
    console.log('Orientation Change', o);
    setOrientation(o);
  });

  return {
    changeDrawType: changeDrawType,
    getDrawTypes: getDrawTypes,
    lockOrientation: lockOrientation,
    onLongPress: onLongPress,
    unlockOrientation: unlockOrientation,
  };
};

export default useHome;
