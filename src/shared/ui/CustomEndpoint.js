import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import uiStyles from './ui.styles';
import {updateCustomMap} from '../../modules/maps/maps.slice';
import useMap from '../../modules/maps/useMap';
import signInStyles from '../../modules/sign-in/signIn.styles';
import {setDatabaseIsSelected, setCustomDatabaseUrl} from '../../services/connections.slice';
import {STRABO_APIS} from '../../services/urls.constants';
import commonStyles from '../common.styles';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const CustomEndpoint = ({
                          containerStyles,
                          textStyles,
                          route,
                        }) => {
    const dispatch = useDispatch();
    const {endpoint, isSelected} = useSelector(state => state.connections.databaseEndpoint);
    const customMaps = useSelector(state => state.map.customMaps);

    const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);
    const [isVerified, setIsVerified] = useState(null);
    const [verifiedButtonTitle, setVerifiedButtonTitle] = useState('Test Endpoint');

    const {setBasemap} = useMap();

    const handleEndpointSwitchValue = async (value) => {
      Object.values(customMaps).map(map => map.isViewable && dispatch(updateCustomMap({...map, isViewable: false})));
      await setBasemap();
      if (!value) dispatch(setCustomDatabaseUrl(STRABO_APIS.DB));
      dispatch(setDatabaseIsSelected(value));
    };

    const handleEndpointTextValues = (endpointURLLocal) => {
      dispatch(setCustomDatabaseUrl(endpointURLLocal));
      console.log('Endpoint dispatched', endpointURLLocal);
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
                placeholder={'http://192.168.xxx/db'}
                labelStyle={{fontSize: 10}}
                defaultValue={endpoint}
                autoCapitalize={'none'}
                returnKeyType={'send'}
              />

            </View>
            <>
              {isSelected && <Text style={[commonStyles.noValueText, {paddingTop: 0, fontStyle: 'italic'}, textStyles]}>
                *If using StraboSpot Offline make sure that the endpoint address contains <Text style={{fontWeight: 'bold'}}>&ldquo;http://&ldquo; and a
                trailing &ldquo;/db&ldquo;</Text>.{'\n'} Otherwise use the proper
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
