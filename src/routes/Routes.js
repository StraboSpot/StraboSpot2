import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import AppStack from './AppStack';
import AuthStack from './AuthStack';
import LoadingSplashScreen from '../modules/sign-in/LoadingSplashScreen';
import useSignInHook from '../modules/sign-in/useSignIn';
import {login, logout} from '../modules/user/userProfile.slice';
import {isEmpty} from '../shared/Helpers';

const Routes = () => {
  console.log('Rendering Routes...');

  const useSignIn = useSignInHook();
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const userInfo = useSelector(state => state.user);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    autoSignIn().then(() => console.log('Should be signed in'));
  }, []);

  const autoSignIn = async () => {
    try {
      if (Platform.OS === 'web') await useSignIn.autoLogin();
      else if (userInfo.name && !isEmpty(currentProject)) dispatch(login());
      else dispatch(logout());
    }
    finally {
      setIsLoading(false);
    }
  };

  return isLoading ? <LoadingSplashScreen/>
    : userInfo.isAuthenticated ? <AppStack/> : <AuthStack/>;
};

export default Routes;
