import {AppRegistry, YellowBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import * as Sentry from '@sentry/react-native';
// import {SENTRY_DSN} from "react-native-dotenv"; //Changed to come from Config.js

// Sentry.init({
//   dsn: SENTRY_DSN,
//   enableNative: true,
// });

YellowBox.ignoreWarnings(["Require cycle:", "Remote debugger", "Warning:",
  'Module RNSimpleCompass requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`.'
]);

AppRegistry.registerComponent(appName, () => App);
