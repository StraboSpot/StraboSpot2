import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty, readDataUrl} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setProjectLoadSelectionModalVisible,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import useProjectHook from '../project/useProject';
import {login, logout, setUserData} from '../user/userProfile.slice';

const useSignIn = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const encodedLogin = useSelector(state => state.user.encoded_login);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  const useServerRequests = useServerRequestsHook();
  const navigation = useNavigation();
  const [useProject] = useProjectHook();

  const project = useRef(null);

  let timeout;

  useEffect(() => {
    if (Platform.OS === 'web' && isAuthenticated) checkAuthentication();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const credentials = atob(encodedLogin);
    const email = credentials.split(':')[0];
    const password = credentials.split(':')[1];
    await signIn(email, password);
    console.log('Passed Authentication Check');
    checkAuthenticationRestartTimer();
  };

  const checkAuthenticationRestartTimer = () => {
    console.log('Restarting Authentication Check Timer...');

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      checkAuthentication();
    }, 1000 * 300);  // 300 Seconds (5 minutes)
  };

  useEffect(() => {
    console.log('Encoded Login Updated', encodedLogin);
    if (Platform.OS === 'web' && !isEmpty(encodedLogin) && !isEmpty(project.current?.id)) {
      useProject.loadProjectWeb(project.current);
    }
  }, [encodedLogin, project]);

  const autoLogin = async () => {
    const url = new URL(window.location).href;
    const credentialsRegEx = new RegExp('[?&]' + 'credentials' + '=([^&]+).*$');
    const credentialsEncoded = url.match(credentialsRegEx)?.[1];

    const projectIdRegEx = new RegExp('[?&]' + 'projectid' + '=([^&]+).*$');
    const projectId = url.match(projectIdRegEx)?.[1];
    project.current = {id: projectId};

    console.log('Credentials', credentialsEncoded, 'Project Id', projectId);
    console.log('Auto Login Here...');
    console.log('First, force logout and destroy project');
    console.log('Credentials set, check for validity.');

    if (credentialsEncoded) {
      try {
        const credentials = atob(credentialsEncoded);
        const email = credentials.split('*****')[0];
        const password = credentials.split('*****')[1];
        return await signIn(email, password);
      }
      catch (err) {
        autoLoginError(err);
      }
    }
    else autoLoginError('Credentials not found.');
  };

  const autoLoginError = (err) => {
    console.log('Auto Login Error', err);
    dispatch(setStatusMessagesModalVisible(false));
    dispatch(clearedStatusMessages());
    dispatch(addedStatusMessage('Error loading project!'));
    dispatch(setErrorMessagesModalVisible(true));
    dispatch(setLoadingStatus({view: 'home', bool: false}));
  };

  const createAccount = () => {
    navigation.navigate('SignUp');
  };

  const getUserImage = async (userProfileImage) => {
    if (userProfileImage) {
      return new Promise((resolve, reject) => {
        readDataUrl(userProfileImage, (base64Image) => {
          if (base64Image && typeof base64Image === 'string') resolve(base64Image);
          else reject('Could not convert image to base64');
        });
      });
    }
    else return require('../../assets/images/noimage.jpg');
  };

  const guestSignIn = async () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'});
    });
    if (!isEmpty(user.name)) dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    setTimeout(() => isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true)), 500);
  };

  const signIn = async (username, password, setUsername, setPassword, setErrorMessage, setIsErrorModalVisible) => {
    console.log(`Authenticating ${username} and signing in...`);
    try {
      const userAuthResponse = await useServerRequests.authenticateUser(username, password);
      // login with provider
      if (userAuthResponse?.valid === 'true') {
        Sentry.configureScope((scope) => {
          scope.setUser({'username': user.name, 'email': user.email});
        });
        const newEncodedLogin = Base64.encode(username + ':' + password);
        await updateUserResponse(newEncodedLogin);
        console.log(`${username} is successfully logged in!`);
        if (Platform.OS !== 'web') {
          isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true));
          dispatch(setLoadingStatus({view: 'home', bool: false}));
        }
        if (setUsername) setUsername('');
        if (setPassword) setPassword('');
        dispatch(login());
      }
      else throw Error('Login Failure!\n\nIncorrect username and/or password');
      return userAuthResponse?.valid;
    }
    catch (err) {
      console.error(err);
      Sentry.captureException(err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      if (setErrorMessage) setErrorMessage(err);
      if (setIsErrorModalVisible) setIsErrorModalVisible(true);
      if (setPassword) setPassword('');
      dispatch(logout());
      throw Error;
    }
  };

  const updateUserResponse = async (newEncodedLogin) => {
    try {
      let userProfileRes = await useServerRequests.getProfile(newEncodedLogin);
      const userProfileImage = await useServerRequests.getProfileImage(newEncodedLogin);
      console.log('userProfileImage', userProfileImage);
      if (!isEmpty(userProfileImage)) {
        const profileImage = await getUserImage(userProfileImage);
        dispatch(setUserData({...userProfileRes, image: profileImage, encoded_login: newEncodedLogin}));
      }
      else dispatch(setUserData({...userProfileRes, image: null, encoded_login: newEncodedLogin}));
    }
    catch (err) {
      console.log('SIGN IN ERROR', err);
    }
  };

  return {
    autoLogin: autoLogin,
    createAccount: createAccount,
    guestSignIn: guestSignIn,
    signIn: signIn,
  };
};

export default useSignIn;
