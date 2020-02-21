import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import configureStore from './src/store/ConfigureStore';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import SignIn from './src/views/sign-in/SignIn';
import ImageInfo from './src/components/images/ImageInfo.view';
import SignUp from './src/views/sign-up/SignUp';
import Home from './src/views/home/Home';
import 'react-native-gesture-handler';
import Loading from './src/shared/ui/Loading';

const App = () => {
   const {store, persistor} = configureStore();

    const RootStack = createStackNavigator(
      {
        HomeScreen: {
          screen: Home,
          navigationOptions: {
            gesturesEnabled: false,
          },
        },
        SignIn: {
          screen: SignIn,
        },
        SignUp: {
          screen: SignUp,
        },
        ImageInfo: {
          screen: ImageInfo,
          navigationOptions: {
            gesturesEnabled: false,
          },
        },
      },
      {
        initialRouteName: 'SignIn',
        headerMode: 'none',
      },
    );

    let Navigation = createAppContainer(RootStack);

    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </Provider>
    );
};

 export default App;
