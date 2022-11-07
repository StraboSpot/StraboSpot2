// import './wdyr';
import {AppRegistry, LogBox} from 'react-native';

import App from './App';
import {name as appName} from './app.json';
// import {SENTRY_DSN} from './Config'; //Changed to come from dev-test-logins.js

// Sentry.init({
//   dsn: SENTRY_DSN,
//   enableNative: true,
// });

LogBox.ignoreLogs([
  'Require cycle:',
  'Remote debugger',
  'Warning:',
  'Module RNSimpleCompass requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`.',
  'Sending `zipArchiveProgressEvent` with no listeners registered.',
  'currentlyFocusedField is deprecated and will be removed in a future release. Use currentlyFocusedInput',
  'Mapbox error You\'re calling ',
]);

AppRegistry.registerComponent(appName, () => App);
