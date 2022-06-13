import 'react-native-gesture-handler';
import React from 'react';

import * as Sentry from '@sentry/react-native';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import {SENTRY_DSN} from './Config';
import Routes from './src/routes/Routes';
import {BUNDLE_ID, RELEASE_NAME} from './src/shared/app.constants';
import Loading from './src/shared/ui/Loading';
import store from './src/store/ConfigureStore';

Sentry.init({
  dsn: SENTRY_DSN,
  enableNative: true,
  debug: __DEV__,
  release: RELEASE_NAME,
  dist: RELEASE_NAME,
  autoSessionTracking: true,
  environment: __DEV__ ? 'development' : 'production',
  deactivateStacktraceMerging: true,
});

const App = () => {
  const persistor = persistStore(store);
  // const persistorPurge = persistStore(store).purge(); // Use this to clear persistStore completely

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        {/*<Sentry.TouchEventBoundary>*/}
          <Routes/>
        {/*</Sentry.TouchEventBoundary>*/}
      </PersistGate>
    </Provider>
  );
};

export default Sentry.wrap(App);
