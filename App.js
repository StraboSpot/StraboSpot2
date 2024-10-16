import React from 'react';
import {Platform} from 'react-native';
import 'react-native-devsettings';

import * as NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import Routes from './src/routes/Routes';
import ConnectionStatus from './src/services/ConnectionStatus';
import SystemBars from './src/services/SystemBars';
import Toast from './src/shared/ui/Toast';
import {store, persistor} from './src/store/ConfigureStore';

let didInit = false;

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
            <SystemBars/>
            <ConnectionStatus/>
            <NavigationContainer>
              <Routes/>
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </Toast>
    </SafeAreaProvider>
  );
};

// export default Sentry.wrap(App);
export default App;
