import 'react-native-gesture-handler';
import React from 'react';

import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import {SENTRY_DSN} from './Config';
import Route from './src/routes/Routes';
import {VERSION_NUMBER} from './src/shared/app.constants';
import Loading from './src/shared/ui/Loading';
import store from './src/store/ConfigureStore';

Sentry.init({
  dsn: SENTRY_DSN,
  enableNative: true,
  debug: __DEV__,
  release: `org.StraboSpot2-${VERSION_NUMBER}`,
  dist:'org.StraboSpot2',
  autoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
});

NetInfo.configure({
  reachabilityUrl: 'https://clients3.google.com/generate_204',
  reachabilityTest: async (response) => {
    console.log('Response Status', response.status);
    return response.status === 204
  },
  reachabilityLongTimeout: 60 * 1000, // 60s
  reachabilityShortTimeout: 5 * 1000, // 5s
  reachabilityRequestTimeout: 15 * 1000, // 15s
});

const App = () => {
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <Route/>
      </PersistGate>
    </Provider>
  );
};

export default App;
