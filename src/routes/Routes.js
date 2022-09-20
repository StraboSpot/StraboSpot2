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
  // const netInfo = useNetInfo();
  const Stack = createStackNavigator();
  const AppStack = createStackNavigator();

  NetInfo.configure({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async response => response.status === 204,
    reachabilityLongTimeout: 120 * 1000, // 60s
    reachabilityShortTimeout: 120 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
    reachabilityShouldRun: () => true,
    useNativeReachability: false,
    shouldFetchWiFiSSID: true,
  });

  useEffect(() => {
    console.log('UERoutes');
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isInternetReachable !== null && state.isConnected !== null) dispatch(setOnlineStatus(state));
    });
    return () => unsubscribe();
  }, []);
  //
  // NetInfo.addEventListener((state) => {
  //   if (state.isInternetReachable !== null && state.isConnected !== null) dispatch(setOnlineStatus(state));
  // });

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  const AppScreens = () => {
    // const isSignedIn = useSelector(state => state.home.isSignedIn);
    const user = useSelector(state => state.user);
    const currentProject = useSelector(state => state.project.project);
    return (
      <AppStack.Navigator
        initialRouteName={user.name && !isEmpty(currentProject) ? 'HomeScreen' : 'SignIn'}>
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
