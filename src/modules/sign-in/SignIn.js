import React, {useEffect, useState} from 'react';
import {Alert, Platform, Switch, Text, TextInput, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {Base64} from 'js-base64';
import {Button, Icon, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {PASSWORD_TEST, USERNAME_TEST} from '../../../dev-test-logins';
import useDeviceHook from '../../services/useDevice';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty, readDataUrl} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import WarningModal from '../home/home-modals/WarningModal';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setLoadingStatus,
  setProjectLoadSelectionModalVisible,
  setWarningModalVisible,
} from '../home/home.slice';
import {setDatabaseIsSelected, setDatabaseVerify} from '../project/projects.slice';
import Splashscreen from '../splashscreen/Splashscreen';
import {setUserData} from '../user/userProfile.slice';
import styles from './signIn.styles';
import signInStyles from './signIn.styles';

const SignIn = (props) => {

  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const customDatabaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);

  const {protocol, domain, path, isSelected, isVerified} = customDatabaseEndpoint;

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
  // const [endpointValue, setEndpointValue] = useState(url);
  const [protocolValue, setProtocolValue] = useState(protocol);
  const [domainValue, setDomainValue] = useState(domain);
  const [pathValue, setPathValue] = useState(path);

  const useDevice = useDeviceHook();
  const navigation = useNavigation();
  const [serverRequests] = useServerRequests();

  useEffect(() => {
    console.log('UE SignIn []');
    useDevice.createProjectDirectories().catch(err => console.error('Error creating app directories', err));
    Platform.OS === 'android' && useDevice.requestReadDirectoryPermission()
      .catch(err => console.error('Error getting permissions', err));

  }, []);

  const guestSignIn = async () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'});
    });
    if (!isEmpty(user.name)) dispatch({type: 'CLEAR_STORE'});
    console.log('Loading user: GUEST');
    await navigation.navigate('HomeScreen');
    setTimeout(() => isEmpty(currentProject) && dispatch(setProjectLoadSelectionModalVisible(true)), 500);
  };

  const handleEndpointSwitchValue = (value) => {
    dispatch(setDatabaseIsSelected(value));
  };

  const handleEndpointTextValues = (value, input) => {
    setErrorMessage('');
    dispatch(setDatabaseVerify(false));
    if (input === 'domain') setDomainValue(value);
    if (input === 'protocol') setProtocolValue(value);
    if (input === 'path') pathValue(value);
  };

  const signIn = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
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
          // setIsLoading(false);
          dispatch(setLoadingStatus({view: 'home', bool: false}));
          setUsername('');
          setPassword('');
          navigation.navigate('HomeScreen');
        });
      }
      else {
        Alert.alert('Login Failure', 'Incorrect username and/or password');
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        setPassword('');
      }
    }
    catch (err) {
      console.log('error:', err);
      Sentry.captureException(err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
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
          disabled={username === '' || password === '' || (isSelected && !isVerified) || !isOnline.isConnected}
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

  const renderCustomEndpointEntry = () => {
    return (
      <View style={signInStyles.customEndpointContainer}>
        <View style={{alignItems: 'center', flexDirection: 'row', height: 50}}>
          <Text style={signInStyles.customEndpointText}>Use Custom Endpoint?</Text>
          <Switch
            value={isSelected}
            onValueChange={handleEndpointSwitchValue}
            trackColor={{true: PRIMARY_ACCENT_COLOR}}
            ios_backgroundColor={'white'}
          />
        </View>
        {customDatabaseEndpoint.isSelected
          && (
            <View style={styles.verifyContainer}>
              <Input
                containerStyle={signInStyles.verifyProtocolInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.verifyInput}
                onChangeText={value => handleEndpointTextValues(value, 'protocol')}
                label={'Protocol'}
                labelStyle={{fontSize: 10}}
                defaultValue={protocolValue}
                autoCapitalize={'none'}
              />
              <Input
                containerStyle={signInStyles.verifySchemeInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.verifyInput}
                onChangeText={value => handleEndpointTextValues(value, 'domain')}
                value={domainValue}
                label={'Host'}
                labelStyle={{fontSize: 10}}
                errorMessage={errorMessage}
                errorStyle={{fontSize: 12, fontWeight: 'bold', textAlign: 'center'}}
                autoCapitalize={'none'}
                autoCorrect={false}
              />
              <Input
                containerStyle={signInStyles.verifySubdirectoryInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.verifyInput}
                onChangeText={value => handleEndpointTextValues(value, 'path')}
                label={'Path'}
                labelStyle={{fontSize: 10}}
                value={pathValue}
                editable={false}
                autoCapitalize={'none'}
              />
              {isVerified ? <Icon
                  reverse
                  name='checkmark-sharp'
                  type='ionicon'
                  size={15}
                  color='green'
                />
                : <Button
                  title={'Verify'}
                  disabled={!isOnline.isConnected || isEmpty(domainValue)}
                  buttonStyle={styles.verifyButtonStyle}
                  containerStyle={styles.verifyButtonContainer}
                  onPress={() => verifyEndpoint()}
                  loading={isLoadingEndpoint}
                  loadingStyle={{width: 60}}
                />}
            </View>
          )
        }
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

  const verifyEndpoint = async () => {
    setIsLoadingEndpoint(true);
    const isVerified = await serverRequests.verifyEndpoint(protocolValue, domainValue, pathValue);
    if (isVerified) setIsLoadingEndpoint(false);
    else {
      setErrorMessage('Not Reachable');
      setIsLoadingEndpoint(false);
    }
  };

  return (
    <Splashscreen>
      <View style={{marginTop: 20}}>
        <View style={styles.signInContainer}>
          <TextInput
            style={styles.input}
            placeholder={'Email'}
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
          {renderCustomEndpointEntry()}
        </View>
      </View>
      <WarningModal/>
    </Splashscreen>
  );
};

export default SignIn;
