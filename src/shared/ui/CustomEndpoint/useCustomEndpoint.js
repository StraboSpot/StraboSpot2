import React from 'react';
import {Text, View} from 'react-native';
import {Base64} from 'js-base64';
import {setCustomDatabaseUrl, setDatabaseVerify} from '../../../services/connections.slice';
import useServerRequests from '../../../services/useServerRequests';
import {useSelector} from 'react-redux';

const useCustomEndpoint = (props) => {

  const {email, encoded_login} = useSelector(state => state.user);

  const {authenticateUser, verifyEndpoint} = useServerRequests();


  const onVerifyEndpoint = async ({customEndpointURLLocal}) => {
    const isIPValidAndConnected = await verifyEndpoint(customEndpointURLLocal);
    if (isIPValidAndConnected) {
      const decodeLogin = Base64.decode(encoded_login).split(':');
      const isAuthenticated = await authenticateUser(customEndpointURLLocal, decodeLogin[0], decodeLogin[1]);
      if (isAuthenticated.valid === 'true') {
        dispatch(setDatabaseVerify(true));
        dispatch(setCustomDatabaseUrl(customEndpointURLLocal));
        setVerifiedButtonTitle('Verified');
        // setIsVerified(true);
        setIsLoadingEndpoint(false);
      }
      else {
        dispatch(setDatabaseVerify(false));
        setVerifiedButtonTitle('Try Again');
        // setIsVerified(false);
        setIsError(true);
        setIsLoadingEndpoint(false);
      }
    }
    else {
      console.log(`${customEndpointURLLocal} is not valid`);
      dispatch(setDatabaseVerify(false));
      setVerifiedButtonTitle('Try Again');
      // setIsVerified(false);
      setIsError(true);
      setIsLoadingEndpoint(false);
    }
  };

  return {
    onVerifyEndpoint,
  };
};

export default useCustomEndpoint;
