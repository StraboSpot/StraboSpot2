import React, {useEffect} from 'react';

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

const Routes = () => {
  const dispatch = useDispatch();

  const Stack = createStackNavigator();
  const AppStack = createStackNavigator();

  NetInfo.configure({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async (response) => {
      // console.log('Response Status', response.status);
      return response.status === 204;
    },
    reachabilityLongTimeout: 5 * 1000, // 60s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((networkState) => {
      console.log('Connection type', networkState.type);
      console.log('Is connected?', networkState.isConnected);
      console.log('Is internet reachable?', networkState.isInternetReachable);
      dispatch(setOnlineStatus(networkState));
    });
    return () => {
      console.log('Network Test unsubscribed');
      unsubscribe();
    };
  }, []);

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  const AppScreens = () => {
    const isSignedIn = useSelector(state => state.home.isSignedIn);
    const user = useSelector(state => state.user);
    const currentProject = useSelector(state => state.project.project);
    return (
      <AppStack.Navigator
        initialRouteName={isSignedIn && user.name && !isEmpty(currentProject) ? 'HomeScreen' : 'SignIn'}>
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

  return (
    <NavigationContainer>
      <AppScreens/>
    </NavigationContainer>
  );
};

export default Routes;
