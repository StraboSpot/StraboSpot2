import React, {useEffect, useState} from 'react';
import {Alert, TextInput, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {PASSWORD_TEST, USERNAME_TEST} from '../../../dev-test-logins';
import useDeviceHook from '../../services/useDevice';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty, readDataUrl} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';
import WarningModal from '../home/home-modals/WarningModal';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setProjectLoadSelectionModalVisible,
  setWarningModalVisible,
} from '../home/home.slice';
import Splashscreen from '../splashscreen/Splashscreen';
import {setUserData} from '../user/userProfile.slice';
import styles from './signIn.styles';

const SignIn = (props) => {

  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');

  const useDevice = useDeviceHook();
  const navigation = useNavigation();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    console.log('UE SignIn []');
    useDevice.createProjectDirectories().catch(err => console.error('Error creating app directories', err));
  }, []);

  const guestSignIn = async () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'});
    });
    if (!isEmpty(user.name)) dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true));
    await navigation.navigate('HomeScreen');
  };

  const signIn = async () => {
    setIsLoading(true);
    console.log(`Authenticating ${username} and signing in...`);
    try {
      const userAuthResponse = await serverRequests.authenticateUser(username, password);
      // login with provider
      if (userAuthResponse?.valid === 'true') {
        Sentry.configureScope((scope) => {
          scope.setUser({'username': user.name, 'email': user.email});
        });
        const encodedLogin = Base64.encode(username + ':' + password);
        updateUserResponse(encodedLogin).then((userState) => {
          console.log(`${username} is successfully logged in!`);
          isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true));
          // dispatch(setSignedInStatus(true));
          setIsLoading(false);
          setUsername('');
          setPassword('');
          navigation.navigate('HomeScreen');
        });
      }
      else {
        Alert.alert('Login Failure', 'Incorrect username and/or password');
        setIsLoading(false);
        setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
      Sentry.captureException(err);
      setIsLoading(false);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(err));
      dispatch(setWarningModalVisible(true));
    }
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <Button
          type={'solid'}
          containerStyle={styles.buttonContainer}
          onPress={() => signIn()}
          buttonStyle={styles.buttonStyle}
          disabled={username === '' || password === ''}
          title={'Sign In'}
        />
        <Button
          type={'solid'}
          containerStyle={styles.buttonContainer}
          onPress={() => createAccount()}
          buttonStyle={styles.buttonStyle}
          title={'Sign Up'}
        />
        <Button
          type={'solid'}
          onPress={() => guestSignIn()}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonStyle}
          title={'Continue as Guest'}
        />
      </View>
    );
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

  const updateUserResponse = async (encodedLogin) => {
    try {
      let userProfileRes = await serverRequests.getProfile(encodedLogin);
      const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
      console.log('userProfileImage', userProfileImage);
      if (!isEmpty(userProfileImage)) {
        const profileImage = await getUserImage(userProfileImage);
        dispatch(setUserData({...userProfileRes, image: profileImage, encoded_login: encodedLogin}));
      }
      else dispatch(setUserData({...userProfileRes, image: null, encoded_login: encodedLogin}));
    }
    catch (err) {
      console.log('SIGN IN ERROR', err);
    }
  };

  const createAccount = () => {
    props.navigation.navigate('SignUp');
  };

  return (
    <Splashscreen>
      <View>
        <View style={styles.signInContainer}>
          <TextInput
            style={styles.input}
            placeholder={'Username'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={'#6a777e'}
            onChangeText={val => setUsername(val.toLowerCase())}
            value={username}
            keyboardType={'email-address'}
            returnKeyType={'go'}
          />
          <TextInput
            style={styles.input}
            placeholder={'Password'}
            autoCapitalize={'none'}
            secureTextEntry={true}
            placeholderTextColor={'#6a777e'}
            onChangeText={val => setPassword(val)}
            value={password}
            returnKeyType={'go'}
            onSubmitEditing={signIn}
          />
          {renderButtons()}
        </View>
      </View>
      <WarningModal/>
      <Loading isLoading={isLoading}/>
    </Splashscreen>
  );
};

export default SignIn;
