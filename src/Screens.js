import {Navigation} from 'react-native-navigation';
import Home from "./screens/Home";
import Initialising from "./Initializing";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import Screen2 from "./screens/Screen2";

export function registerScreens() {
  Navigation.registerComponent('Home', () => Home);
  Navigation.registerComponent('Initializing', () => Initialising);
  Navigation.registerComponent('SignIn', () => SignIn);
  Navigation.registerComponent('SignUp', () => SignUp);
  Navigation.registerComponent('Screen2', () => Screen2);
}