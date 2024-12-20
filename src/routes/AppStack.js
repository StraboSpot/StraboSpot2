import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import HomeContainer from '../modules/home/HomeContainer';
import {ImageInfo, ImageSlider} from '../modules/images';
import IGSNPage from '../modules/samples/IGSNPage';
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
        component={HomeContainer}
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
      <Stack.Screen
        name={'IGSN'}
        component={IGSNPage}
        options={navigationOptions}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
