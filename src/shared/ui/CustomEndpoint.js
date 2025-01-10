import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import uiStyles from './ui.styles';
import signInStyles from '../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setCustomDatabaseUrl} from '../../services/connections.slice';
import commonStyles from '../common.styles';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';
import * as themes from '../styles.constants';

const CustomEndpoint = ({
                          containerStyles,
                          textStyles,
                          route,
                        }) => {
    const dispatch = useDispatch();
    const {endpoint, isSelected} = useSelector(state => state.connections.databaseEndpoint);

    const [customEndpointURLLocal, setCustomEndpointURLLocal] = useState(endpoint);
    const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
    const [isVerified, setIsVerified] = useState(null);
    const [verifiedButtonTitle, setVerifiedButtonTitle] = useState('Test Endpoint');

    const handleEndpointSwitchValue = (value) => {
      dispatch(setDatabaseIsSelected(value));
    };

    const handleEndpointTextValues = (endpointURLLocal) => {
      dispatch(setCustomDatabaseUrl(endpointURLLocal));
      console.log('Endpoint dispatched', customEndpointURLLocal);
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
              />

            </View>
            <>
              {isSelected && <Text style={[commonStyles.noValueText, {paddingTop: 0, fontStyle: 'italic'}, textStyles]}>
                *If using StraboSpot Offline make sure that the endpoint address contains a trailing &lsquo;/db&lsquo;. Otherwise use the proper
                path associated with your endpoint address.
              </Text>}
            </>
          </>
        )}
      </View>
    );
  }
;

export default CustomEndpoint;
