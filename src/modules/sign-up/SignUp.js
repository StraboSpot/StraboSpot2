import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import styles from './signUp.styles';
import useServerRequests from '../../services/useServerRequests';
import {validate} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import StatusDialog from '../../shared/ui/StatusDialogBox';
import SplashScreen from '../splash-screen/SplashScreen';

const SignUp = ({navigation}) => {
  const initialState = {
    firstName: {
      value: '',
      valid: false,
      validationRules: {
        notEmpty: false,
      },
      touched: false,
    },
    lastName: {
      value: '',
      valid: false,
      validationRules: {
        notEmpty: false,
      },
      touched: false,
    },
    password: {
      value: '',
      valid: false,
      validationRules: {
        characterValidator: false,
      },
      touched: false,
      showPassword: false,
    },
    confirmPassword: {
      value: '',
      valid: false,
      validationRules: {
        equalTo: 'password',
      },
      touched: false,
    },
    email: {
      value: '',
      valid: false,
      validationRules: {
        isEmail: true,
      },
      touched: false,
    },
  };

  const isOnline = useSelector(state => state.connections.isOnline);

  const {registerUser} = useServerRequests();

  const [isLoading, setIsLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusDialogTitle, setStatusDialogTitle] = useState(null);
  const [userData, setUserData] = useState(initialState);

  const onChangeText = (key, value) => {
    let connectedValue = {};

    // Checks to see if password and confirm password match
    if (userData[key].validationRules.equalTo) {
      const equalControl = userData[key].validationRules.equalTo;
      const equalValue = userData[equalControl].value;
      connectedValue = {
        ...connectedValue,
        equalTo: equalValue,
      };
    }
    if (key === 'password') {
      // schema.has().digits();
      // schema.has().uppercase();
      // console.log('Validating Password', schema.validate(value));
      connectedValue = {
        ...connectedValue,
        equalTo: value,
      };
    }

    setUserData(prevState => ({
      ...prevState,
      confirmPassword: {
        ...prevState.confirmPassword,
        valid: key === 'password'
          ? validate(prevState.confirmPassword.value, prevState.confirmPassword.validationRules, connectedValue)
          : prevState.confirmPassword.valid,
      },
      [key]: {
        ...prevState[key],
        value: value,
        valid: validate(value, prevState[key].validationRules, connectedValue),
        touched: true,
      },
    }));
  };

  const signUp = async () => {
    console.log('ConnectedValue', userData.password.value);
    setIsLoading(true);
    try {
      const newUser = await registerUser(userData);
      console.log('res', newUser);
      if (newUser.valid) {
        if (newUser.message.includes('A confirmation link has been emailed')) {
          setStatusDialogTitle('Welcome!');
          setUserData(initialState);
          console.log('user successfully signed up!: ');
        }
        else setStatusDialogTitle('Something went wrong...!');
        setIsLoading(false);
        setStatusDialog(true);
        setStatusMessage(newUser.message);
      }
      else {
        setIsLoading(false);
        setStatusDialogTitle('Uh Oh!');
        setStatusMessage(newUser.message);
      }
    }
    catch (err) {
      console.log('error signing up: ', err);
      setIsLoading(false);
      setStatusMessage('Error signing up. \n Possible bad network connection');
      setStatusDialog(true);
    }
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <Button
          title={'Register'}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
          disabled={!isOnline.isInternetReachable}
          onPress={signUp}
        />
        <Button
          title={'Back to Log In'}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    );
  };

  return (
    <SplashScreen>
      <View style={styles.signUpContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={'First Name'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={themes.MEDIUMGREY}
            onChangeText={val => onChangeText('firstName', val)}
            value={userData.firstName.value || ''}
          />
          <TextInput
            style={styles.input}
            placeholder={'Last Name'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={themes.MEDIUMGREY}
            onChangeText={val => onChangeText('lastName', val)}
            value={userData.lastName.value || ''}
          />
        </View>
        <View style={{width: '100%'}}>
          <Text style={styles.text}>Password must contain at least one uppercase, one digit, and no spaces</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={'Password'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={themes.MEDIUMGREY}
            onChangeText={val => onChangeText('password', val)}
            value={userData.password.value || ''}
          />
          <TextInput
            style={styles.input}
            placeholder={'Confirm Password'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={themes.MEDIUMGREY}
            secureTextEntry={!userData.password.showPassword}
            onChangeText={val => onChangeText('confirmPassword', val)}
            value={userData.confirmPassword.value || ''}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={'Email'}
            autoCapitalize={'none'}
            autoCorrect={false}
            placeholderTextColor={themes.MEDIUMGREY}
            onChangeText={val => onChangeText('email', val)}
            value={userData.email.value || ''}
          />
        </View>
        {renderButtons()}
      </View>
      <StatusDialog
        isVisible={statusDialog}
        title={statusDialogTitle}
        onTouchOutside={() => setStatusDialog(false)}
      >
        <Text>{statusMessage}</Text>
      </StatusDialog>
      <Loading isLoading={isLoading}/>
    </SplashScreen>
  );
};

export default SignUp;
