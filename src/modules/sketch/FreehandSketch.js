import React, {useEffect, useRef} from 'react';
import {Dimensions, Platform, View} from 'react-native';

import RNSketchCanvas from '@StraboSpot/react-native-sketch-canvas';
import {useDispatch} from 'react-redux';

import useDeviceOrientation from '../home/useDeviceOrientation';
import {setFreehandFeatureCoords} from '../maps/maps.slice';

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const {height, width} = Dimensions.get(platform);
let freehandFeatureCoords = [];

const FreehandSketch = ({mapMode}) => {
  const dispatch = useDispatch();

  const {lockOrientation, unlockOrientation} = useDeviceOrientation();

  const freehandDrawRef = useRef(null);

  useEffect(() => {
    lockOrientation();
    return () => unlockOrientation();
  }, []);

  useEffect(() => {
    clear();
  }, [mapMode]);

  const clear = ()=> freehandDrawRef.current.clear();

  const onStrokeChanged = (x, y) => freehandFeatureCoords.push([x, y]);

  const onStrokeEnd = () => dispatch(setFreehandFeatureCoords(freehandFeatureCoords));

  const onStrokeStart = () => {
    if (freehandFeatureCoords.length > 1) clear();
    freehandFeatureCoords = [];
  };

  return (
    <View style={{position:'absolute', width: width, height: height}}>
      <RNSketchCanvas
        canvasStyle={{backgroundColor: 'transparent', flex: 1}}
        containerStyle={{backgroundColor: 'transparent', flex: 1}}
        defaultStrokeIndex={13} // Orange
        defaultStrokeWidth={3}
        onStrokeChanged={onStrokeChanged}
        onStrokeEnd={onStrokeEnd}
        onStrokeStart={onStrokeStart}
        ref={freehandDrawRef}
      />
    </View>
  );
};

export default FreehandSketch;
