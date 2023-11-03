import React, {useEffect, useState} from 'react';
import {Platform, Text, TextInput, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {PASSWORD_TEST, USERNAME_TEST} from '../../../dev-test-logins';
import useDeviceHook from '../../services/useDevice';
import CustomEndpoint from '../../shared/ui/CustomEndpoint';
import ErrorModal from '../home/home-modals/ErrorModal';
import Splashscreen from '../splashscreen/Splashscreen';
import signInStyles from './signIn.styles';
import useSignInHook from './useSignIn';

const SignIn = () => {
  console.log('Rendering SignIn...');

  const customDatabaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const isOnline = useSelector(state => state.home.isOnline);

  const {isSelected, isVerified} = customDatabaseEndpoint;

  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [password, setPassword] = useState(__DEV__ ? PASSWORD_TEST : '');
  const [username, setUsername] = useState(__DEV__ ? USERNAME_TEST : '');

  const useDevice = useDeviceHook();
  const useSignIn = useSignInHook();

  useEffect(() => {
    console.log('UE SignIn []');
    useDevice.createProjectDirectories().catch(err => console.error('Error creating app directories', err));
    Platform.OS === 'android' && useDevice.requestReadDirectoryPermission()
      .catch(err => console.error('Error getting permissions', err));
  }, []);

  const renderButtons = () => {
    return (
      <View style={signInStyles.buttonsContainer}>
        <Button
          type={'solid'}
          containerStyle={signInStyles.buttonContainer}
          onPress={() => useSignIn.signIn(username, password, setUsername, setPassword, setErrorMessage,
            setIsErrorModalVisible)}
          buttonStyle={signInStyles.buttonStyle}
          disabled={username === '' || password === '' || (isSelected && !isVerified) || !isOnline.isConnected}
          title={'Sign In'}
        />
        <Button
          type={'solid'}
          containerStyle={signInStyles.buttonContainer}
          onPress={() => useSignIn.createAccount()}
          buttonStyle={signInStyles.buttonStyle}
          title={'Sign Up'}
        />
        <Button
          type={'solid'}
          onPress={() => useSignIn.guestSignIn()}
          containerStyle={signInStyles.buttonContainer}
          buttonStyle={signInStyles.buttonStyle}
          title={'Continue as Guest'}
        />
      </View>
    );
  };

  const renderErrorModal = () => {
    return (
      <ErrorModal
        isVisible={isErrorModalVisible}
        closeModal={() => setIsErrorModalVisible(false)}
      >
        <Text style={signInStyles.errorText}>{errorMessage}</Text>
      </ErrorModal>
    );
  };

  return (
    <Splashscreen>
      <View style={{marginTop: 20}}>
        <View style={signInStyles.signInContainer}>
          <TextInput
            style={signInStyles.input}
            placeholder={'Email'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={'#6a777e'}
            onChangeText={val => setUsername(val.toLowerCase())}
            value={username || ''}
            keyboardType={'email-address'}
            returnKeyType={'go'}
          />
          <TextInput
            style={signInStyles.input}
            placeholder={'Password'}
            autoCapitalize={'none'}
            secureTextEntry={true}
            placeholderTextColor={'#6a777e'}
            onChangeText={val => setPassword(val)}
            value={password || ''}
            returnKeyType={'go'}
            onSubmitEditing={() => useSignIn.signIn(username, password, setUsername, setPassword, setErrorMessage,
              setIsErrorModalVisible)}
          />
          {renderButtons()}
          <CustomEndpoint
            containerStyles={signInStyles.customEndpointContainer}
            textStyles={signInStyles.customEndpointText}
            iconText={signInStyles.verifyEndpointIconText}
          />
        </View>
        {renderErrorModal()}
      </View>
    </Splashscreen>
  );
};

export default SignIn;
