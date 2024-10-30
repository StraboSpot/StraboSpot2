import React, {useEffect, useState} from 'react';

import {useSelector} from 'react-redux';

import AppStack from './AppStack';
import useAuthentication from '../modules/sign-in/useAuthentication.web';
import useAutoLogIn from '../modules/sign-in/useAutoLogIn';
import AuthenticationErrorSplashScreen from '../modules/splash-screen/AuthenticationErrorSplashScreen';
import LoadingSplashScreen from '../modules/splash-screen/LoadingSplashScreen.web';

const Routes = () => {
  console.count('Rendering Routes...');

  const {autoLogIn} = useAutoLogIn();
  useAuthentication();

  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('UE Routes');
    (async () => {
      try {
        await autoLogIn();
        console.log('Should be logged in');
        console.log('Project should be loaded');
        setIsLoading(false);
      }
      catch (e) {
        console.error('Error with the auto log in.', e);
        setIsLoading(false);
      }
    })();
  }, []);

  console.log('Is still loading?', isLoading);
  console.log('Is user authenticated?', isAuthenticated);

  if (isLoading) return <LoadingSplashScreen/>;
  else if (isAuthenticated) return <AppStack/>;
  return <AuthenticationErrorSplashScreen/>;
};

export default Routes;
