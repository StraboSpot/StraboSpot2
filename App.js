import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import configureStore from './src/store/ConfigureStore';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import NavigationServices from './src/routes/NavagationServices';
import SignIn from './src/views/SignIn';
import ImageInfo from './src/components/images/ImageInfo.view';
import SignUp from './src/views/SignUp';
import Home from './src/views/home/Home';
import 'react-native-gesture-handler';
import Loading from './src/shared/ui/Loading';

const {store, persistor} = configureStore();

const RootStack = createStackNavigator(
  {
    SignIn: {
      screen: SignIn,
    },
    SignUp: {
      screen: SignUp
    },
    HomeScreen: {
      screen: Home
    },
    ImageInfo: {
      screen: ImageInfo
    }
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  },
);

let Navigation = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <Navigation
            ref={navigatorRef => NavigationServices.setTopLevelNavigator(navigatorRef)}
          />
        </PersistGate>
      </Provider>
    );
  }
}
