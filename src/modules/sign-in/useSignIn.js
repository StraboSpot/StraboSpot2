import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import {REDUX} from '../../shared/app.constants';
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
import {setUserData} from '../user/userProfile.slice';

const useSignIn = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const encodedLogin = useSelector(state => state.user.encoded_login);

  const [serverRequests] = useServerRequests();
  const navigation = useNavigation();
  const [useProject] = useProjectHook();

  const project = useRef(null);

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
    dispatch({type: REDUX.CLEAR_STORE});

    console.log('Credentials set, check for validity.');

    if (credentialsEncoded) {
      try {
        const credentials = atob(credentialsEncoded);
        console.log('Credentials decoded: ', credentials);
        const login = {};
        login.email = credentials.split('*****')[0];
        login.password = credentials.split('*****')[1];
        login.encoded_login = btoa(login.email + ':' + login.password);

        await signIn(login.email, login.password);
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
    navigation.navigate('HomeScreen');
    setTimeout(() => isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true)), 500);
  };

  const signIn = async (username, password, setUsername, setPassword, setErrorMessage, setIsErrorModalVisible) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    console.log(`Authenticating ${username} and signing in...`);
    try {
      const userAuthResponse = await serverRequests.authenticateUser(username, password);
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
        navigation.navigate('HomeScreen');
      }
      else {
        if (setErrorMessage) setErrorMessage('Login Failure!\n\nIncorrect username and/or password');
        if (setIsErrorModalVisible) setIsErrorModalVisible(true);
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        if (setPassword) setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
      Sentry.captureException(err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      if (setErrorMessage) setErrorMessage(err);
    }
  };

  const updateUserResponse = async (newEncodedLogin) => {
    try {
      let userProfileRes = await serverRequests.getProfile(newEncodedLogin);
      const userProfileImage = await serverRequests.getProfileImage(newEncodedLogin);
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
