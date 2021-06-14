import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import {Provider, useDispatch} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import {SENTRY_DSN} from './Config';
import Route from './src/routes/Routes';
import {BUNDLE_ID, RELEASE_NAME, VERSION_NUMBER} from './src/shared/app.constants';
import CheckConnection from './src/shared/CheckConnection';
import Loading from './src/shared/ui/Loading';
import store from './src/store/ConfigureStore';

Sentry.init({
  dsn: SENTRY_DSN,
  enableNative: true,
  debug: __DEV__,
  release: RELEASE_NAME,
  dist: BUNDLE_ID,
  autoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
});

const App = () => {
  // const network = CheckConnection();
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely

  let networkStatus = CheckConnection();

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <Sentry.TouchEventBoundary>
          <Route network={networkStatus}/>
        </Sentry.TouchEventBoundary>
      </PersistGate>
    </Provider>
  );
};

export default App;
