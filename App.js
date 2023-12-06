import React from 'react';
import {Platform, SafeAreaView} from 'react-native';

import * as NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import Routes from './src/routes/Routes';
import ConnectionStatus from './src/services/ConnectionStatus';
import {RELEASE_NAME} from './src/shared/app.constants';
import Loading from './src/shared/ui/Loading';
import Toast from './src/shared/ui/Toast';
import uiStyles from './src/shared/ui/ui.styles';
import store from './src/store/ConfigureStore';
import config from './src/utils/config';

Sentry.init({
  dsn: config.get('Error_reporting_DSN'),
  enableNative: Platform.OS !== 'web',
  debug: __DEV__,
  release: RELEASE_NAME,
  dist: RELEASE_NAME,
  autoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
  // deactivateStacktraceMerging: true,
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
  console.log('Rendering App...');
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely

  return (
    <SafeAreaView style={uiStyles.androidSafeAreaView}>
      <Toast>
        <Provider store={store}>
          <PersistGate loading={<Loading/>} persistor={persistor}>
            {/*<Sentry.TouchEventBoundary>*/}
            <ConnectionStatus/>
            <NavigationContainer>
              <Routes/>
            </NavigationContainer>
            {/*</Sentry.TouchEventBoundary>*/}
          </PersistGate>
        </Provider>
      </Toast>
    </SafeAreaView>
  );
};

export default Sentry.wrap(App);
