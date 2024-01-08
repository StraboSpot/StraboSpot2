import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import SignIn from '../modules/sign-in/SignIn';
import SignUp from '../modules/sign-up/SignUp';

const AuthStack = () => {

  const Stack = createStackNavigator();

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'SignIn'}
        component={SignIn}
        options={navigationOptions}
        // initialParams={{setIsSignedIn}}
      />
      <Stack.Screen
        name={'SignUp'}
        component={SignUp}
        options={navigationOptions}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
