import 'react-native-gesture-handler';
import React from 'react';

import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import Route from './src/routes/Routes';
import Loading from './src/shared/ui/Loading';
import configureStore from './src/store/ConfigureStore';

Sentry.init({
  dsn: 'https://4a3776035f3d425c997d45dc6d05e659@o201723.ingest.sentry.io/1783328',
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
