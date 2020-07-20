import {AppRegistry, YellowBox} from 'react-native';

import * as Sentry from '@sentry/react-native';

import App from './App';
import {name as appName} from './app.json';
import {SENTRY_DSN} from './Config'; //Changed to come from Config.js

Sentry.init({
  dsn: SENTRY_DSN,
  enableNative: true,
});

YellowBox.ignoreWarnings([
  'Require cycle:',
  'Remote debugger',
  'Warning:',
  'Module RNSimpleCompass requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`.',
  'Sending `zipArchiveProgressEvent` with no listeners registered.',
]);

AppRegistry.registerComponent(appName, () => App);
