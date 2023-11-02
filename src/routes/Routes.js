import React from 'react';
import {Platform} from 'react-native';

import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';

import Home from '../modules/home/Home';
import ImageInfo from '../modules/images/ImageInfo';
import ImageSlider from '../modules/images/ImageSlider';
import SignIn from '../modules/sign-in/SignIn';
import SignUp from '../modules/sign-up/SignUp';
import Sketch from '../modules/sketch/Sketch';
import {isEmpty} from '../shared/Helpers';

const Routes = () => {
  console.log('Rendering Routes...');

  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const Stack = createStackNavigator();
  const AppStack = createStackNavigator();

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  return (
    <AppStack.Navigator
      initialRouteName={(user.name && !isEmpty(currentProject)) || Platform.OS === 'web' ? 'HomeScreen' : 'SignIn'}>
      <Stack.Screen
        name={'SignIn'}
        component={SignIn}
        options={navigationOptions}
      />
      <Stack.Screen
        name={'SignUp'}
        component={SignUp}
        options={navigationOptions}
      />
      <Stack.Screen
        name={'HomeScreen'}
        component={Home}
        options={navigationOptions}
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
    </AppStack.Navigator>
  );
};

export default Routes;
