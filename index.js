import {Navigation} from 'react-native-navigation';
import registerScreens from './src/routes/Screens';
import {YellowBox} from "react-native";

YellowBox.ignoreWarnings(["Require cycle:", "Remote debugger", "Warning:",
  'Module RNSimpleCompass requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`.'
]);

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setDefaultOptions({
    topBar: {
      visible: false,
      _height: 0,
      drawBehind: true
    }
  });
  // Navigation.setRoot({
  //   root: {
  //     component: {
  //       name: 'Home',
  //     }
  //   },
  // });
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          // {
          //   component: {
          //     name: 'SpotPage',
          //   }
          // },
          {
            component: {
              name: 'Home',
            }
          }
        ]
      }
    }
  });
});
