import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {Button} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import {USERNAME_TEST, PASSWORD_TEST} from '../../../Config';
import useServerRequests from '../../services/useServerRequests';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {readDataUrl, isEmpty} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import {setOnlineStatus, setSignedInStatus} from '../home/home.slice';
import {setUserData} from '../user/userProfile.slice';
import styles from './signIn.styles';

let isUserAuthenicated = null;

const SignIn = (props) => {

  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);

  const navigation = useNavigation();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected));
    });
  }, [isOnline]);

  const guestSignIn = async () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'});
    });
    if (!isEmpty(user)) await dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    await navigation.navigate('HomeScreen');
  };

  const signIn = async () => {
    console.log(`Authenticating ${username} and signing in...`);
    try {
      isUserAuthenicated = await serverRequests.authenticateUser(username, password);
      // login with provider
      if (isUserAuthenicated === 'true') {
        const encodedLogin = Base64.encode(username + ':' + password);
        updateUserResponse(encodedLogin).then((userState) => {
          console.log(`${username} is successfully logged in!`);
          dispatch(setUserData(userState));
          dispatch(setSignedInStatus(true));
          navigation.navigate('HomeScreen');
        });
      }
      else {
        Alert.alert('Login Failure', 'Incorrect username and/or password');
        setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
      Sentry.captureException(err);
    }
  };

  const renderButtons = () => {
    return (
      <View>
        <Button
          icon={{
            name: 'log-in',
            type: 'ionicon',
            size: 30,
            color: 'white',
          }}
          type={'solid'}
          containerStyle={{marginTop: 30}}
          onPress={() => signIn()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Sign In'}
        />
        <Button
          icon={{
            style: styles.icon,
            name: 'add',
            type: 'ionicon',
            size: 30,
            color: 'white',
          }}
          type={'solid'}
          containerStyle={{marginTop: 10}}
          onPress={() => createAccount()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Create an Account'}
        />
        <Button
          icon={{
            name: 'people',
            type: 'ionicon',
            size: 30,
            color: 'white',
          }}
          type={'solid'}
          onPress={() => guestSignIn()}
          containerStyle={{marginTop: 10}}
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
          if (base64Image) resolve(base64Image);
          else reject('Could not convert image to base64');
        });
      });
    }
    else return require('../../assets/images/noimage.jpg');
  };

  const updateUserResponse = async (encodedLogin) => {
    let userState = {};
    let userProfile = await serverRequests.getProfile(encodedLogin);
    const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
    console.log('userProfileImage', userProfileImage);
    const image = await getUserImage(userProfileImage);
    userState = {...userProfile, image: image, encodedLogin: encodedLogin};
    return Promise.resolve(userState);
  };

  const createAccount = () => {
    props.navigation.navigate('SignUp');
  };

  return (
    <ImageBackground source={require('../../assets/images/background.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={{
          position: 'absolute',
          right: 0,
          top: 40,
          zIndex: -1,
        }}>
          <IconButton
            source={isOnline ? online : offline}
          />
        </View>
        <KeyboardAvoidingView
          behavior={'position'}
          contentContainerStyle={{
            // flex: 1,
            // justifyContent: 'space-between',
          }}
          keyboardVerticalOffset={0}
        >
          <View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Strabo Spot 2</Text>
              <Text style={styles.version}>{VERSION_NUMBER}</Text>
            </View>
            <View style={styles.signInContainer}>
              <TextInput
                style={styles.input}
                placeholder='Username'
                autoCapitalize='none'
                autoCorrect={false}
                placeholderTextColor='#6a777e'
                onChangeText={val => setUsername(val.toLowerCase())}
                value={username}
                keyboardType='email-address'
                returnKeyType='go'
              />
              <TextInput
                style={styles.input}
                placeholder='Password'
                autoCapitalize='none'
                secureTextEntry={true}
                placeholderTextColor='#6a777e'
                onChangeText={val => setPassword(val)}
                value={password}
                returnKeyType='go'
                onSubmitEditing={signIn}
              />
              {renderButtons()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default SignIn;

