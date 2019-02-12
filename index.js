import {Navigation} from 'react-native-navigation';
import {registerScreens} from './src/routes/Screens';

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setDefaultOptions({
    topBar: {
      visible: false,
      _height: 0,
      drawBehind: true
    }
  });
  Navigation.setRoot({
    root: {
      component: {
        name: 'Initializing'
      }
    },
  });
});

