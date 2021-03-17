import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';

import Home from '../modules/home/Home';
import ImageInfo from '../modules/images/ImageInfo';
import SignIn from '../modules/sign-in/SignIn';
import SignUp from '../modules/sign-up/SignUp';
import Sketch from '../modules/sketch/Sketch';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

const navigationOptions = {
  gestureEnabled: false,
  headerShown: false,
};

const AppScreens = () => {
  const isSignedIn = useSelector(state => state.home.isSignedIn);
  const user = useSelector(state => state.user);
  return (
    <AppStack.Navigator initialRouteName={isSignedIn && user.name ? 'HomeScreen' : 'SignIn'}>
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
        name={'Sketch'}
        component={Sketch}
        options={navigationOptions}
      />
    </AppStack.Navigator>
  );
};

const Route = () => {
  return (
    <NavigationContainer>
      <AppScreens/>
    </NavigationContainer>
  );
};

export default Route;
