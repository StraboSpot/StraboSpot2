import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {Button, Icon, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import uiStyles from './ui.styles';
import signInStyles from '../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setDatabaseVerify} from '../../services/connections.slice';
import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../Helpers';
import * as themes from '../styles.constants';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const CustomEndpoint = ({
                          containerStyles,
                          iconText,
                          textStyles,
                        }) => {
  const dispatch = useDispatch();
  const customDatabaseEndpoint = useSelector(state => state.connections.databaseEndpoint);
  const isOnline = useSelector(state => state.connections.isOnline);

  const {protocol, domain, path, isSelected, isVerified} = customDatabaseEndpoint;

  const [domainValue, setDomainValue] = useState(domain);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
  const [protocolValue, setProtocolValue] = useState(protocol);

  const useServerRequests = useServerRequestsHook();

  const handleEndpointSwitchValue = (value) => {
    dispatch(setDatabaseIsSelected(value));
  };

  const handleEndpointTextValues = (value, input) => {
    setErrorMessage('');
    dispatch(setDatabaseVerify(false));
    if (input === 'domain') setDomainValue(value);
    if (input === 'protocol') setProtocolValue(value);
    if (input === 'path') path(value);
  };

  const verifyEndpoint = async () => {
    setIsLoadingEndpoint(true);
    const isVerified = await useServerRequests.verifyEndpoint(protocolValue, domainValue, path);
    if (isVerified) setIsLoadingEndpoint(false);
    else {
      setErrorMessage('Not Reachable');
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
      {customDatabaseEndpoint.isSelected && (
        <View>
          <View style={uiStyles.customEndpointVerifyInputContainer}>
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
              placeholder={'192.168.x.xxx'}
              placeholderTextColor={themes.MEDIUMGREY}
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
              value={path}
              autoCapitalize={'none'}
            />
          </View>
          <View style={uiStyles.customEndpointVerifyButtonContainer}>
            {isVerified
              ? (
                <View style={uiStyles.customEndpointVerifyIconContainer}>
                  <Text style={[iconText]}>Verified</Text>
                  <Icon
                    reverse
                    name={'checkmark-sharp'}
                    type={'ionicon'}
                    size={10}
                    color={'green'}
                  />
                </View>
              )
              : <Button
                title={'Verify'}
                disabled={!isOnline.isConnected || isEmpty(domainValue)}
                buttonStyle={uiStyles.verifyButtonStyle}
                titleStyle={{color: 'white'}}
                containerStyle={uiStyles.customEndpointVerifyButtonContainer}
                onPress={() => verifyEndpoint()}
                loading={isLoadingEndpoint}
                loadingStyle={{width: 60}}
              />
            }
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomEndpoint;
