import React from 'react';
import {Navigation} from 'react-native-navigation';
import {Provider} from 'react-redux';
import configureStore from '../store/ConfigureStore';
import {PersistGate} from 'redux-persist/integration/react';
import {
  HOME,
  INITALIZING,
  SIGN_IN,
  SIGN_UP,
  SPOT_PAGE,
  IMAGEGALLERY,
  IMAGEINFO
} from './ScreenNameConstants';
import Home from "../views/home/Home";
import Initialising from "../Initializing";
import SignIn from "../views/SignIn";
import SignUp from "../views/SignUp";
import ImageGallery from "../components/images/ImageGallery.view";
import ImageInfo from "../components/images/ImageInfo.view";
import Loading from '../shared/ui/Loading'

const {store, persistor} = configureStore();

function WrappedComponent(Component) {
  return function inject(props) {
    const EnhancedComponent = () => (
      <Provider store={store}>
        <PersistGate loading={<Loading/>} persistor={persistor}>
          <Component
            {...props}
          />
        </PersistGate>
      </Provider>
    );

    return <EnhancedComponent />;
  };
}

export default function() {
  Navigation.registerComponent(HOME, () => WrappedComponent(Home));
  Navigation.registerComponent(INITALIZING, () => WrappedComponent(Initialising));
  Navigation.registerComponent(SIGN_IN, () => WrappedComponent(SignIn));
  Navigation.registerComponent(SIGN_UP, () => WrappedComponent(SignUp));
  Navigation.registerComponent(IMAGEGALLERY, () => WrappedComponent(ImageGallery));
  Navigation.registerComponent(IMAGEINFO, () => WrappedComponent(ImageInfo));
  console.log("All screens have been registered...")
}
