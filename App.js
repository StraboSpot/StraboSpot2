import 'react-native-gesture-handler';
import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import Home from './src/modules/home/Home';
import ImageInfo from './src/modules/images/ImageInfo';
import SignIn from './src/modules/sign-in/SignIn';
import SignUp from './src/modules/sign-up/SignUp';
import Sketch from './src/modules/sketch/Sketch';
import Loading from './src/shared/ui/Loading';
import configureStore from './src/store/ConfigureStore';

Sentry.init({
  dsn: 'https://4a3776035f3d425c997d45dc6d05e659@o201723.ingest.sentry.io/1783328',
});

const Stack = createStackNavigator();

const App = () => {

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  const {store, persistor} = configureStore();

  return (
      <Provider store={store}>
        <PersistGate loading={<Loading/>} persistor={persistor}>
          <NavigationContainer>
          <Stack.Navigator initialRouteName={'SignIn'}>
            <Stack.Screen name={'SignUp'} component={SignUp} options={navigationOptions}/>
            <Stack.Screen name={'SignIn'} component={SignIn} options={navigationOptions}/>
            <Stack.Screen name={'HomeScreen'} component={Home} options={navigationOptions}/>
            <Stack.Screen name={'ImageInfo'} component={ImageInfo} options={navigationOptions}/>
            <Stack.Screen name={'Sketch'} component={Sketch} options={navigationOptions}/>
          </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
      </Provider>
  );
};

export default App;
