import React, {useEffect, useState} from 'react';

import {useSelector} from 'react-redux';

import AppStack from './AppStack';
import useProjectHook from '../modules/project/useProject';
import useAuthenticationHook from '../modules/sign-in/useAuthentication.web';
import useSignInHook from '../modules/sign-in/useSignIn';
import AuthenticationErrorSplashScreen from '../modules/splash-screen/AuthenticationErrorSplashScreen';
import LoadingSplashScreen from '../modules/splash-screen/LoadingSplashScreen.web';

const Routes = () => {
  console.count('Rendering Routes...');

  const useProject = useProjectHook();
  const useSignIn = useSignInHook();
  useAuthenticationHook();

  const encodedLogin = useSelector(state => state.user.encoded_login);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const selectedProjectId = useSelector(state => state.project.selectedProject.project.id);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('UE Routes');
    (async () => {
      try {
        await useSignIn.autoLogin();
        console.log('Should be signed in');
      }
      catch (e) {
        console.error('Error with the auto login.', e);
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    console.log('UE Routes', 'selectedProjectId:', selectedProjectId);
    if (isAuthenticated && encodedLogin && selectedProjectId) {
      (async () => {
        try {
          await useProject.loadProjectWeb(selectedProjectId);
          console.log('Project should be loaded');
          setIsLoading(false);
        }
        catch (e) {
          console.error('Error getting the project.');
        }
      })();
    }
  }, [encodedLogin, isAuthenticated, selectedProjectId]);

  console.log('Is still loading?', isLoading);
  console.log('Is user authenticated?', isAuthenticated);

  if (isLoading) return <LoadingSplashScreen/>;
  else if (isAuthenticated) return <AppStack/>;
  return <AuthenticationErrorSplashScreen/>;
};

export default Routes;
