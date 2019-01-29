import {Navigation} from 'react-native-navigation';
import {registerScreens} from './src/Screens';

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      component: {
        name: 'Initializing'
      }
    },
  });
});

