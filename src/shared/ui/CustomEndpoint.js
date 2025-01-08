import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {Button, Icon, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import uiStyles from './ui.styles';
import signInStyles from '../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setCustomDatabaseUrl, setDatabaseVerify} from '../../services/connections.slice';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty} from '../Helpers';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const CustomEndpoint = ({
                          containerStyles,
                          textStyles,
                        }) => {
    const dispatch = useDispatch();
    const isOnline = useSelector(state => state.connections.isOnline);
    const {url, isSelected} = useSelector(state => state.connections.databaseEndpoint);

    const [customEndpointURLLocal, setCustomEndpointURLLocal] = useState(url);
    const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
    const [isVerified, setIsVerified] = useState(null);
    const [verifiedButtonTitle, setVerifiedButtonTitle] = useState('Test Endpoint');

    const {verifyEndpoint} = useServerRequests();

    const handleEndpointSwitchValue = (value) => {
      dispatch(setDatabaseIsSelected(value));
    };

    const handleEndpointTextValues = (endpointURLLocal) => {
      dispatch(setDatabaseVerify(false));
      setCustomEndpointURLLocal(endpointURLLocal);
    };

    const onVerifyEndpoint = async () => {
      setIsLoadingEndpoint(true);
      const isVerifiedLocal = await verifyEndpoint(customEndpointURLLocal);
      if (isVerifiedLocal) {
        dispatch(setDatabaseVerify(true));
        dispatch(setCustomDatabaseUrl(customEndpointURLLocal));
        setVerifiedButtonTitle('Verified');
        setTimeout(() => {
          setVerifiedButtonTitle('Test Endpoint');
          setIsVerified(null);
        }, 2500);
        setIsVerified(true);
        setIsLoadingEndpoint(false);
      }
      else {
        dispatch(setDatabaseVerify(false));
        setVerifiedButtonTitle('Not Reachable');
        setIsVerified(false);
        setIsLoadingEndpoint(false);
      }
    };

    return (
      <View style={[uiStyles.customEndpointContainer, containerStyles]}>
        <View style={uiStyles.customEndpointSwitchContainer}>
          <Text style={[uiStyles.customEndpointText, textStyles]}>Use Custom Database Endpoint?</Text>
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
                onChangeText={value => handleEndpointTextValues(value)}
                label={'Enter endpoint IP address'}
                placeholder={'http://192.168.xxx'}
                labelStyle={{fontSize: 10}}
                defaultValue={customEndpointURLLocal}
                autoCapitalize={'none'}
                returnKeyType={'send'}
                onSubmitEditing={onVerifyEndpoint}
              />
            </View>
            <View style={uiStyles.customEndpointVerifyButtonContainer}>
              {<Button
                title={isVerified === false ? 'Not Reachable\nCheck Again?' : verifiedButtonTitle}
                type={'clear'}
                disabled={!isOnline.isConnected || isEmpty(customEndpointURLLocal)}
                buttonStyle={uiStyles.verifyButtonStyle}
                iconRight
                icon={isVerified && (
                  <Icon
                    reverse
                    name={'checkmark-sharp'}
                    type={'ionicon'}
                    size={10}
                    color={isVerified ? 'green' : 'red'}
                  />
                )}
                containerStyle={uiStyles.customEndpointVerifyButtonContainer}
                onPress={onVerifyEndpoint}
                loading={isLoadingEndpoint}
                loadingStyle={{width: 60}}
              />}
            </View>
          </>
        )}
      </View>
    );
  }
;

export default CustomEndpoint;
