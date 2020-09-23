import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {Button, CheckBox} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import {USERNAME_TEST, PASSWORD_TEST} from '../../../Config';
import useServerRequests from '../../services/useServerRequests';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {readDataUrl, isEmpty} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import uiStyles from '../../shared/ui/ui.styles';
import {homeReducers} from '../home/home.constants';
import {USER_DATA, USER_IMAGE, ENCODED_LOGIN} from '../user/user.constants';
import styles from './signIn.styles';

let user = null;

const SignIn = (props) => {
  const navigation = useNavigation();

  const online = require('../../assets/icons/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/ConnectionStatusButton_offline.png');
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
  const isSignedIn = useSelector(state => state.home.isSignedIn);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    NetInfo.addEventListener(state => {
      dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
    });
  }, [isOnline]);

  useEffect(() => {
    Sentry.configureScope((scope) => {
      scope.setUser({'email': userData.email});
    });
  }, [userData]);

  useEffect(() => [isSignedIn]);

  const guestSignIn = async () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'});
    });
    if (!isEmpty(props.userData)) await dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    await navigation.navigate('HomeScreen');
  };

  const signIn = async () => {
    console.log('Authenticating and signing in...');
    user = await serverRequests.authenticateUser(username, password);
    try {
      // login with provider
      if (user === 'true') {
        const encodedLogin = Base64.encode(username + ':' + password);
        updateUserResponse(encodedLogin).then(() => {
          navigation.navigate('HomeScreen');
          console.log(`${username} is successfully logged in!`);
        });
      }
      else {
        Alert.alert('Login Failure', 'Incorrect username and/or password');
        setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
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
        {!isSignedIn && <Button
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
        />}
      </View>
    );
  };

  const updateUserResponse = async (encodedLogin) => {
    let userProfile = await serverRequests.getProfile(encodedLogin);
    dispatch({type: ENCODED_LOGIN, value: encodedLogin});
    dispatch({type: USER_DATA, userData: userProfile});
    const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
    if (userProfileImage) {
      readDataUrl(userProfileImage, (base64Image) => {
        dispatch({type: USER_IMAGE, userImage: base64Image});
      });
    }
    else {
      dispatch({type: USER_IMAGE, userImage: require('../../assets/images/noimage.jpg')});
    }
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
              <CheckBox
                checked={isSignedIn}
                title={'Keep me signed in'}
                textStyle={{color: 'white'}}
                uncheckedColor={'white'}
                checkedColor={'white'}
                containerStyle={uiStyles.defaultCheckBox}
                onIconPress={() => dispatch({type: homeReducers.SET_IS_SIGNED_IN, bool: !isSignedIn})}/>
              {renderButtons()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default SignIn;
