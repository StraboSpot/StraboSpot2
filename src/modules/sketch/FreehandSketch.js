import React from 'react';
import {View} from 'react-native';

import RNSketchCanvas from '@StraboSpot/react-native-sketch-canvas';
import {useDispatch} from 'react-redux';

import styles from './sketch.styles';
import {setFreehandFeatureCoords} from '../maps/maps.slice';

let freehandFeatureCoords = [];
const FreehandSketch = () => {
  const dispatch = useDispatch();

  const onDrop = () => {
    dispatch(setFreehandFeatureCoords(freehandFeatureCoords));
  };

  const freeDraw = (coords) => {
    freehandFeatureCoords.push(coords);
  };

  return (
    <View style={{...styles.container, opacity: 0.3}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <RNSketchCanvas
          onStrokeStart={() => freehandFeatureCoords = []}
          onStrokeChanged={(x, y) => freeDraw([x, y])}
          onStrokeEnd={(x, y) => onDrop()}
          containerStyle={{backgroundColor: 'transparent', flex: 1}}
          canvasStyle={{backgroundColor: 'transparent', flex: 1, borderWidth: 2}}
          defaultStrokeIndex={13} // orange color.
          defaultStrokeWidth={5}
        />
      </View>
    </View>
  );
};

export default FreehandSketch;
