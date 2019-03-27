import {Navigation} from 'react-native-navigation';
import Home from "../views/home/Home";
import Initialising from "../Initializing";
import SignIn from "../views/SignIn";
import SignUp from "../views/SignUp";
import SpotPage from "../views/SpotPage";
import Images from "../views/images/Images";

export function registerScreens() {
  Navigation.registerComponent('Home', () => Home);
  Navigation.registerComponent('Initializing', () => Initialising);
  Navigation.registerComponent('SignIn', () => SignIn);
  Navigation.registerComponent('SignUp', () => SignUp);
  Navigation.registerComponent('SpotPage', () => SpotPage);
  Navigation.registerComponent('Images', () => Images);
}
