import 'react-native-gesture-handler';
import React from 'react';

import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {SENTRY_DSN} from './Config';
import Route from './src/routes/Routes';
import Loading from './src/shared/ui/Loading';
import configureStore from './src/store/ConfigureStore';

Sentry.init({
  dsn: SENTRY_DSN,
  enableNative: true,
});

const App = () => {

  const {store, persistor} = configureStore();

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <Route/>
      </PersistGate>
    </Provider>
  );
};

export default App;
