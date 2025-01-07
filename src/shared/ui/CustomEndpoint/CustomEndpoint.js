import React, {useEffect, useState} from 'react';
import {Switch, Text, View} from 'react-native';



import {Base64} from 'js-base64';
import {Button, CheckBox, Icon, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import signInStyles from '../../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setCustomDatabaseUrl, setDatabaseVerify} from '../../../services/connections.slice';
import useServerRequests from '../../../services/useServerRequests';
import {isEmpty} from '../../Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../styles.constants';
import uiStyles from '../ui.styles';
// import customEndpointStyles from './customEndpoint.styles';

const CustomEndpoint = ({
                          containerStyles,
                          handleVerify,
                          textStyles,
                        }) => {

  const dispatch = useDispatch();
    const isOnline = useSelector(state => state.connections.isOnline);
    const {url, isSelected, isVerified} = useSelector(state => state.connections.databaseEndpoint);
    const {email, encoded_login} = useSelector(state => state.user);

    const [customEndpointURLLocal, setCustomEndpointURLLocal] = useState(url);
    const [customEndpointUsername, setCustomEndpointUsername] = useState(email);
    const [customEndpointPassword, setCustomEndpointPassword] = useState('');
    // const [isVerified, setIsVerified] = useState(null);
    const [isError, setIsError] = useState(false);
    const [verifiedButtonTitle, setVerifiedButtonTitle] = useState('Verify');

    // const {authenticateUser, verifyEndpoint} = useServerRequests();

    useEffect(() => {
      if (!isSelected) {
        setVerifiedButtonTitle('Verify');
        setIsError(false);
        dispatch(setDatabaseVerify(false));
      }
    }, [isSelected]);

    const handleEndpointSwitchValue = (value) => {
      dispatch(setDatabaseIsSelected(value));
      // setIsVerified(false);
    };

    const handleEndpointTextValues = (type, value) => {
      dispatch(setDatabaseVerify(false));
      setVerifiedButtonTitle('Verify');
      // setIsVerified(false);
      setIsError(false);
      setCustomEndpointURLLocal(value);
    };

    // const onVerifyEndpoint = async () => {
    //   setIsLoadingEndpoint(true);
    //   const isIPValidAndConnected = await verifyEndpoint(customEndpointURLLocal);
    //   if (isIPValidAndConnected) {
    //     const decodeLogin = Base64.decode(encoded_login).split(':');
    //     const isAuthenticated = await authenticateUser(customEndpointURLLocal, decodeLogin[0], decodeLogin[1]);
    //     if (isAuthenticated.valid === 'true') {
    //       dispatch(setDatabaseVerify(true));
    //       dispatch(setCustomDatabaseUrl(customEndpointURLLocal));
    //       setVerifiedButtonTitle('Verified');
    //       // setIsVerified(true);
    //       setIsLoadingEndpoint(false);
    //     }
    //     else {
    //       dispatch(setDatabaseVerify(false));
    //       setVerifiedButtonTitle('Try Again');
    //       // setIsVerified(false);
    //       setIsError(true);
    //       setIsLoadingEndpoint(false);
    //     }
    //   }
    //   else {
    //     console.log(`${customEndpointURLLocal} is not valid`);
    //     dispatch(setDatabaseVerify(false));
    //     setVerifiedButtonTitle('Try Again');
    //     // setIsVerified(false);
    //     setIsError(true);
    //     setIsLoadingEndpoint(false);
    //   }
    // };

    // const handleEndpointSelection = (value) => {
    //
    // }

    return (
      <View style={[uiStyles.customEndpointContainer, containerStyles]}>
        <View style={uiStyles.customEndpointSwitchContainer}>
          {/*<View style={customEndpointStyles.checkBox}>*/}
          {/*  <CheckBox*/}
          {/*    checked={handleEndpointSelection('default')}*/}
          {/*    checkedIcon='dot-circle-o'*/}
          {/*    uncheckedIcon='circle-o'*/}
          {/*  />*/}
          {/*  <Text>Default Endpoint</Text>*/}
          {/*  </View>*/}
          {/*<View style={customEndpointStyles.checkBox}>*/}
          {/*  <CheckBox*/}
          {/*    checked={handleEndpointSelection('custom')}*/}
          {/*    checkedIcon='dot-circle-o'*/}
          {/*    uncheckedIcon='circle-o'*/}
          {/*  />*/}
          {/*  <Text>Custom Endpoint</Text>*/}
          {/*</View>*/}

          <Text style={[uiStyles.customEndpointText, textStyles]}>Use StraboSpot Offline Endpoint?</Text>
          <Switch
            value={isSelected}
            onValueChange={handleEndpointSwitchValue}
            trackColor={{true: PRIMARY_ACCENT_COLOR}}
            ios_backgroundColor={'white'}
          />
        </View>
        {isSelected && (
          <>
            <View style={uiStyles.customEndpointVerifyInputContainer}>
              <Input
                containerStyle={signInStyles.customEndpointInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.customEndpointInput}
                onChangeText={value => handleEndpointTextValues('url', value)}
                label={'Enter full endpoint address'}
                placeholder={'http://192.168.xxx'}
                labelStyle={{fontSize: 10}}
                defaultValue={customEndpointURLLocal}
                autoCapitalize={'none'}
                returnKeyType={'send'}
                onSubmitEditing={handleVerify}
              />
              <Text style={{marginTop: 20, fontSize: 16}}>/db</Text>
              <Icon
                containerStyle={{marginTop: 20, marginLeft: 20}}
                // reverse
                name={isVerified ? 'checkmark-circle-sharp' : isError ? 'close-circle-sharp' : null}
                type={'ionicon'}
                // size={10}
                color={isVerified ? 'green' : 'red'}
              />
            </View>

          </>
        )}
      </View>
    );
  }
;

export default CustomEndpoint;
