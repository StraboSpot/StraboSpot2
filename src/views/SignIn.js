import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TextInput, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native';
import {connect, useSelector, useDispatch} from 'react-redux';
import {authenticateUser} from '../services/user/UserAuth';
import useServerRequests from '../services/useServerRequests';
import * as themes from '../shared/styles.constants';
import {USER_DATA, USER_IMAGE, ENCODED_LOGIN} from '../services/user/User.constants';
// import * as Sentry from '@sentry/react-native';
import {readDataUrl} from '../shared/Helpers';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button} from 'react-native-elements';
import NetInfo from '@react-native-community/netinfo';
import {homeReducers} from './home/Home.constants';
import IconButton from '../shared/ui/IconButton';
import {USERNAME_TEST, PASSWORD_TEST} from '../../Config';
import {Base64} from 'js-base64';
import {isEmpty} from '../shared/Helpers';

let user = null;

const SignIn = (props) => {
  const online = require('../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_connected.png');
  const offline = require('../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_offline.png');
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const project = useSelector(state => state.project.project);
  const dispatch = useDispatch();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isConnected);
    });
  }, []);

  useEffect(() => {
    if (isOnline && !isEmpty(userData) && !isEmpty(project)) {
      props.navigation.navigate('HomeScreen');
    }
    if (isOnline === null) {
      NetInfo.fetch().then(state => {
        dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
      })
        .catch(err => {
          throw (err);
        });
    }
  },[isOnline, userData, project]);

  //function for online/offline state change event handler
  const handleConnectivityChange = (isConnected) => {
    dispatch({type: homeReducers.SET_ISONLINE, online: isConnected});
  };

  const guestSignIn = () => {
    // Sentry.configureScope((scope) => {
    //   scope.setUser({'id': 'GUEST'})
    // });
    console.log('Loading user: GUEST');
    props.navigation.navigate('HomeScreen');
  };

  const signIn = async () => {
    user = await authenticateUser(username, password);
    try {
      // login with provider
      if (user === 'true') {
        const encodedLogin = Base64.encode(username + ':' + password);
        dispatch({type: ENCODED_LOGIN, value: encodedLogin});
        updateUserResponse(encodedLogin).then(() => {
          console.log(`${username} is successfully logged in!`);
          // Sentry.configureScope((scope) => {
          //   scope.setUser({'email': user.email})
          // });
          props.navigation.navigate('HomeScreen');
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
          icon={
            <Icon
              style={styles.icon}
              name={'ios-log-in'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          containerStyle={{marginTop: 30}}
          onPress={() => signIn()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Sign In'}
        />
        <Button
          icon={
            <Icon
              style={styles.icon}
              name={'ios-add'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          containerStyle={{marginTop: 10}}
          onPress={() => createAccount()}
          buttonStyle={styles.buttonStyle}
          disabled={!isOnline}
          title={'Create an Account'}
        />
        <Button
          icon={
            <Icon
              style={styles.icon}
              name={'ios-people'}
              size={30}
              color={'white'}/>
          }
          type={'solid'}
          onPress={() => guestSignIn()}
          containerStyle={{marginTop: 10}}
          buttonStyle={styles.buttonStyle}
          title={'Continue as Guest'}
        />
      </View>
    );
  };

  const updateUserResponse = async (encodedLogin) => {
    let userProfile = await serverRequests.getProfile(encodedLogin);
    console.table(userProfile);
    const userProfileImage = await serverRequests.getProfileImage(encodedLogin);
    if (userProfileImage.data) {
      readDataUrl(userProfileImage, (base64Image) => {
        dispatch({type: USER_IMAGE, userImage: base64Image});
      });
      dispatch({type: USER_DATA, userData: userProfile});
    }
  };

  const createAccount = () => {
    props.navigation.navigate('SignUp');
  };

  return (
    <ImageBackground source={require('../assets/images/background.jpg')} style={styles.backgroundImage}>
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
          behavior={'padding'}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'space-between',
          }}
          keyboardVerticalOffset={150}
        >
          <View style={{alignItems: 'center'}}>
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

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 55,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 14,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  signInContainer: {
    alignItems: 'center',
  },
  buttonStyle: {
    borderRadius: 30,
    paddingRight: 50,
    paddingLeft: 50,
  },
  icon: {
    paddingRight: 15,
  },
});
