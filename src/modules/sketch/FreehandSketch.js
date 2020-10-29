import React from 'react';
import {View} from 'react-native';

import RNSketchCanvas from '@terrylinla/react-native-sketch-canvas';
import {useDispatch} from 'react-redux';

import {mapReducers} from '../maps/maps.constants';
import {setFreehandFeatureCoords} from '../maps/maps.slice';
import styles from './sketch.styles';

let freehandFeatureCoords = new Array();
const Sketch = (props) => {
  const dispatch = useDispatch();

  const onDrop = () => {
    dispatch(setFreehandFeatureCoords(freehandFeatureCoords));
  };

  const freeDraw = (coords) => {
    freehandFeatureCoords.push(coords);
  };

  return (
    <View style={{...styles.container,opacity:0.3 }}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <RNSketchCanvas
          onStrokeStart={() => freehandFeatureCoords = new Array()}
          onStrokeChanged={(x, y) => freeDraw([x,y])}
          onStrokeEnd={(x,y) => onDrop()}
          containerStyle={{backgroundColor: 'transparent', flex: 1}}
          canvasStyle={{backgroundColor: 'transparent', flex: 1, borderWidth: 2}}
          defaultStrokeIndex={13} // orange color.
          defaultStrokeWidth={5}
        />
      </View>
    </View>
  );
};

export default Sketch;
