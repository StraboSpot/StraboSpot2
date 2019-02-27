import {Navigation} from 'react-native-navigation';
import Home from "../views/home/Home";
import Initialising from "../Initializing";
import SignIn from "../views/SignIn";
import SignUp from "../views/SignUp";
import Screen2 from "../views/Screen2";
import Images from "../views/images/Images";
import MapDownload from "../views/MapDownload";


export function registerScreens() {
  Navigation.registerComponent('Home', () => Home);
  Navigation.registerComponent('Initializing', () => Initialising);
  Navigation.registerComponent('SignIn', () => SignIn);
  Navigation.registerComponent('SignUp', () => SignUp);
  Navigation.registerComponent('Screen2', () => Screen2);
  Navigation.registerComponent('Images', () => Images);
  Navigation.registerComponent('MapDownload', () => MapDownload)
}
