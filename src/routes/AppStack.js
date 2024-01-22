import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import Home from '../modules/home/Home';
import {ImageInfo, ImageSlider} from '../modules/images';
import Sketch from '../modules/sketch/Sketch';

const AppStack = () => {

  const Stack = createStackNavigator();

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'HomeScreen'}
        component={Home}
        options={navigationOptions}
        // initialParams={{setIsSignedIn}}
      />
      <Stack.Screen
        name={'ImageInfo'}
        component={ImageInfo}
        options={navigationOptions}
      />
      <Stack.Screen
        name={'ImageSlider'}
        component={ImageSlider}
        options={navigationOptions}
      />
      <Stack.Screen
        name={'Sketch'}
        component={Sketch}
        options={navigationOptions}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
