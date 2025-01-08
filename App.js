import React from 'react';
import {Platform} from 'react-native';

import * as NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import Routes from './src/routes/Routes';
import ConnectionStatus from './src/services/ConnectionStatus';
import SystemBars from './src/services/SystemBars';
import {RELEASE_NAME} from './src/shared/app.constants';
import Toast from './src/shared/ui/Toast';
import {store, persistor} from './src/store/ConfigureStore';
import config from './src/utils/config';

let didInit = false;

if (Platform.OS !== 'web') {
  Sentry.init({
    dsn: config.get('Error_reporting_DSN'),
    enableNative: Platform.OS !== 'web',
    enableAppHangTracking: true,
    debug: __DEV__,
    release: RELEASE_NAME,
    dist: RELEASE_NAME,
    autoSessionTracking: true,
    environment: __DEV__ ? 'development' : 'production',
    // tracesSampleRate: 0.30,
    // _experiments: {
    //   profilesSampleRate: 0.50,
    //   replaysSessionSampleRate: __DEV__ ? 1.0 : 0.5,
    //   replaysOnErrorSampleRate: 1.0,
    // },
    // integrations: [
    //   Sentry.mobileReplayIntegration(),
    // ],
  });
} else console.log('SENTRY NOT RUNNING');

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


const linking = {
  prefixes: ['strabofield://'], // Custom URL scheme
  config: {
    screens: {
      Home: '', // Default screen
      IGSN: 'orcid_id/:id', // Example route with a parameter
    },
  },
};

const App = () => {
  if (Platform.OS === 'web' && !didInit) {
    console.count('Rendering App...');
    persistor.purge(); // Use this to clear persistStore completely
  }
  else console.log('Rendering App...');
  didInit = true;

  return (
    <SafeAreaProvider>
      <Toast>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {/*<Sentry.TouchEventBoundary>*/}
            <SystemBars/>
            <ConnectionStatus/>
            <NavigationContainer linking={linking}>
              <Routes/>
            </NavigationContainer>
            {/*</Sentry.TouchEventBoundary>*/}
          </PersistGate>
        </Provider>
      </Toast>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
