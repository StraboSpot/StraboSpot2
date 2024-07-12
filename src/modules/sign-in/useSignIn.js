import {useRef} from 'react';
import {Platform} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty, readDataUrl} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setIsErrorMessagesModalVisible,
  setIsProjectLoadSelectionModalVisible,
  setIsStatusMessagesModalVisible,
  setLoadingStatus,
} from '../home/home.slice';
import {setSelectedProject} from '../project/projects.slice';
import {login, logout, setUserData} from '../user/userProfile.slice';

const useSignIn = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const userEmail = useSelector(state => state.user.email);

  const useServerRequests = useServerRequestsHook();

  const project = useRef(null);

  const autoLogin = async () => {
    console.log('Performing Auto Login...');

    const url = new URL(window.location).href;
    const credentialsRegEx = new RegExp('[?&]' + 'credentials' + '=([^&]+).*$');
    const credentialsEncoded = url.match(credentialsRegEx)?.[1];
    const projectIdRegEx = new RegExp('[?&]' + 'projectid' + '=([^&]+).*$');
    const projectId = url.match(projectIdRegEx)?.[1];
    project.current = {id: projectId};

    if (credentialsEncoded) {
      try {
        const credentials = atob(credentialsEncoded);
        const email = credentials.split('*****')[0];
        const password = credentials.split('*****')[1];
        console.log('Got Credentials:', credentialsEncoded, '\nGot Project Id:', projectId);
        await signIn(email, password);
        dispatch(setSelectedProject({project: {id: projectId}, source: ''}));
      }
      catch (err) {
        autoLoginError(err);
      }
    }
    else autoLoginError('Credentials not found.');
  };

  const autoLoginError = (err) => {
    console.log('Auto Login Error', err);
    dispatch(setIsStatusMessagesModalVisible(false));
    dispatch(clearedStatusMessages());
    dispatch(addedStatusMessage('Error loading project!'));
    dispatch(setIsErrorMessagesModalVisible(true));
    dispatch(setLoadingStatus({view: 'home', bool: false}));
    throw Error;
  };

  const convertImageToBase64 = async (userProfileImage) => {
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
    if (!isEmpty(userEmail)) dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    setTimeout(() => isEmpty(currentProject) && dispatch(setIsProjectLoadSelectionModalVisible(true)), 500);
  };

  const signIn = async (email, password, setUsername, setPassword, setErrorMessage, setIsErrorModalVisible) => {
    console.log(`Authenticating ${email} and getting user profile...`);
    try {
      const newEncodedLogin = Base64.encode(email + ':' + password);
      let userProfileRes = await useServerRequests.getProfile(newEncodedLogin);
      const userProfileImage = await useServerRequests.getProfileImage(newEncodedLogin);
      const image = isEmpty(userProfileImage) ? null : await convertImageToBase64(userProfileImage);
      console.log(`${email} is successfully logged in!`);
      dispatch(setUserData({...userProfileRes, image: image, encoded_login: newEncodedLogin}));
      dispatch(login());

      Sentry.configureScope((scope) => {
        scope.setUser({'username': userProfileRes.name, 'email': email});
      });

      if (Platform.OS !== 'web') {
        isEmpty(currentProject) && dispatch(setIsProjectLoadSelectionModalVisible(true));
        dispatch(setLoadingStatus({view: 'home', bool: false}));
      }
      if (setUsername) setUsername('');
      if (setPassword) setPassword('');
    }
    catch (err) {
      console.error(err);
      Sentry.captureException(err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      if (setErrorMessage) setErrorMessage('Server request failed');
      if (setIsErrorModalVisible) setIsErrorModalVisible(true);
      if (setPassword) setPassword('');
      dispatch(logout());
      throw Error;
    }
  };

  return {
    autoLogin: autoLogin,
    guestSignIn: guestSignIn,
    signIn: signIn,
  };
};

export default useSignIn;
