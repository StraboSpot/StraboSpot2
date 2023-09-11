import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';

import * as NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
// import VersionCheck from 'react-native-version-check';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import {version} from './package.json';
import Routes from './src/routes/Routes';
import ConnectionStatus from './src/services/ConnectionStatus';
import {RELEASE_NAME} from './src/shared/app.constants';
import Loading from './src/shared/ui/Loading';
import Toast from './src/shared/ui/Toast';
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

  const [isUpdateNeeded, setIsUpdateNeeded] = useState(false);

  // useEffect(() => {
  //   if (Platform.OS === 'ios') {
  //     console.log(VersionCheck.getPackageName());        // com.reactnative.app
  //     console.log(VersionCheck.getCurrentBuildNumber()); // 10
  //     console.log(VersionCheck.getCurrentVersion());     // 0.1.1
  //     VersionCheck.getStoreUrl({appID: 1555903455}).then(storeUrl => console.log('Store URL', storeUrl));
  //     VersionCheck.needUpdate({currentVersion: version}).then(update => setIsUpdateNeeded(update?.isNeeded));
  //   }
  // }, []);

  return (
    <Toast>
      <Provider store={store}>
        <PersistGate loading={<Loading/>} persistor={persistor}>
          {/*<Sentry.TouchEventBoundary>*/}
          <ConnectionStatus/>
          <Routes/>
          {/*</Sentry.TouchEventBoundary>*/}
        </PersistGate>
      </Provider>
    </Toast>
  );
};

export default Sentry.wrap(App);
