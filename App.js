import React from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

import * as NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

// import Routes from './src/routes/Routes';
import {RELEASE_NAME} from './src/shared/app.constants';
import Loading from './src/shared/ui/Loading';
import Toast from './src/shared/ui/Toast';
// import store from './src/store/ConfigureStore';
import config from './src/utils/config';

Sentry.init({
  dsn: config.get('Error_reporting_DSN'),
  enableNative: Platform.OS !== 'web',
  debug: __DEV__,
  release: RELEASE_NAME,
  dist: RELEASE_NAME,
  autoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
  deactivateStacktraceMerging: true,
});

NetInfo.configure({
  // reachabilityUrl: 'https://clients3.google.com/generate_204',
  // reachabilityTest: async (response) => {
  //   console.log('Response Status', response.status);
  //   return response.status === 204;
  // },
  // reachabilityLongTimeout: 5 * 1000, // 60s
  // reachabilityShortTimeout: 5 * 1000, // 5s
  // reachabilityRequestTimeout: 15 * 1000, // 15s
  shouldFetchWiFiSSID: true,
});

const App = () => {
  console.log(Platform.OS);

  if (Platform.OS === 'web') console.log(navigator.onLine ? 'online' : 'offline');

  // launchCamera({}, (response) => {
  //   console.log('launchCamera response:', response);
  // });
  // launchImageLibrary({}, async (response) => {
  //   console.log('launchImageLibrary response:', response);
  // });

  const styles = StyleSheet.create({
    ball: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: 'blue',
      alignSelf: 'center',
    },
  });

  const isPressed = useSharedValue(false);
  const offset = useSharedValue({x: 0, y: 0});
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: offset.value.x},
        {translateY: offset.value.y},
        {scale: withSpring(isPressed.value ? 1.2 : 1)},
      ],
      backgroundColor: isPressed.value ? 'yellow' : 'blue',
    };
  });

  const start = useSharedValue({x: 0, y: 0});
  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  // const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely

  return (
    <SafeAreaView>
      <Toast>
        {/*<Provider store={store}>*/}
        {/*  <PersistGate loading={<Loading/>} persistor={persistor}>*/}
            {/*<Sentry.TouchEventBoundary>*/}
            <StatusBar barStyle={'dark-content'}/>
            <View style={{alignItems: 'center'}}>
              <Text style={{fontSize: 24}}>React Native Web App Example!</Text>
              <Animated.Image
                source={require('./src/assets/images/noimage.jpg')}
                resizeMode={'contain'}
                style={{width: 100, height: 200}}
              />
              <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.ball, animatedStyles]}/>
              </GestureDetector>
            </View>
            {/*<Routes/>*/}
            {/*</Sentry.TouchEventBoundary>*/}
        {/*  </PersistGate>*/}
        {/*</Provider>*/}
      </Toast>
    </SafeAreaView>
  );
};
export default App;
