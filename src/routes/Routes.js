import React, {useEffect, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';

import Home from '../modules/home/Home';
import {setOnlineStatus} from '../modules/home/home.slice';
import ImageInfo from '../modules/images/ImageInfo';
import SignIn from '../modules/sign-in/SignIn';
import SignUp from '../modules/sign-up/SignUp';
import Sketch from '../modules/sketch/Sketch';
import {isEmpty} from '../shared/Helpers';

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
  const currentProject = useSelector(state => state.project.project);
  return (
    <AppStack.Navigator initialRouteName={isSignedIn && user.name && !isEmpty(currentProject) ? 'HomeScreen' : 'SignIn'}>
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
  const dispatch = useDispatch();
  const [isConnectedStatus, setIsConnectedStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = (state.isConnected && state.isInternetReachable);
      setIsConnectedStatus(offline);
      dispatch(setOnlineStatus(offline));
    });
    return () => {
      console.log('Unsubscribed from NetInfo');
      unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <AppScreens/>
    </NavigationContainer>
  );
};

export default Route;
