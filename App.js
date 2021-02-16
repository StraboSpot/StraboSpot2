import 'react-native-gesture-handler';
import React from 'react';

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
  release: `StraboSpot2@${VERSION_NUMBER}`,
  autoSessionTracking: true,
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
