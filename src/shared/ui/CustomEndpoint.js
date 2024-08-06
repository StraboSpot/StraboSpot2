import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {Button, Icon, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import uiStyles from './ui.styles';
import signInStyles from '../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setDatabaseUrl, setDatabaseVerify} from '../../services/connections.slice';
import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../Helpers';
import * as themes from '../styles.constants';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const CustomEndpoint = ({
                          containerStyles,
                          textStyles,
                        }) => {
    const dispatch = useDispatch();
    const isOnline = useSelector(state => state.connections.isOnline);
    const {domain, isSelected, path, protocol} = useSelector(state => state.connections.databaseEndpoint);

    const [domainLocal, setDomainLocal] = useState(domain);
    const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
    const [pathLocal, setPathLocal] = useState(path);
    const [protocolLocal, setProtocolLocal] = useState(protocol);
    const [isVerified, setIsVerified] = useState(null);
    const [verifiedButtonTitle, setVerifiedButtonTitle] = useState('Test Endpoint');

    const useServerRequests = useServerRequestsHook();

    const handleEndpointSwitchValue = (value) => {
      dispatch(setDatabaseIsSelected(value));

    };

    const handleEndpointTextValues = (value, input) => {
      dispatch(setDatabaseVerify(false));
      if (input === 'domain') setDomainLocal(value);
      if (input === 'protocol') setProtocolLocal(value);
      if (input === 'path') setPathLocal(value);
    };

    const verifyEndpoint = async () => {
      setIsLoadingEndpoint(true);
      const isVerifiedLocal = await useServerRequests.verifyEndpoint(protocolLocal, domainLocal, pathLocal);
      if (isVerifiedLocal) {
        dispatch(setDatabaseVerify(true));
        dispatch(setDatabaseUrl({protocol: protocolLocal, domain: domainLocal, path: pathLocal}));
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
          <Text style={[uiStyles.customEndpointText, textStyles]}>Use Custom Endpoint?</Text>
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
                containerStyle={signInStyles.verifyProtocolInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.verifyInput}
                onChangeText={value => handleEndpointTextValues(value, 'protocol')}
                label={'Protocol'}
                labelStyle={{fontSize: 10}}
                defaultValue={protocolLocal}
                autoCapitalize={'none'}
              />
              <Input
                containerStyle={signInStyles.verifySchemeInputContainer}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={signInStyles.verifyInput}
                onChangeText={value => handleEndpointTextValues(value, 'domain')}
                value={domainLocal}
                label={'Host'}
                placeholder={'192.168.x.xxx'}
                placeholderTextColor={themes.MEDIUMGREY}
                labelStyle={{fontSize: 10}}
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
                value={pathLocal}
                autoCapitalize={'none'}
              />
            </View>
            <View style={uiStyles.customEndpointVerifyButtonContainer}>
              {<Button
                title={isVerified === false ? 'Not Reachable\nCheck Again?' : verifiedButtonTitle}
                type={'clear'}
                disabled={!isOnline.isConnected || isEmpty(domainLocal)}
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
                onPress={verifyEndpoint}
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
