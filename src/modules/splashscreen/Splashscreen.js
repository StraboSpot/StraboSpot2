import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatus from '../../services/ConnectionStatus';
import {getFontSizeByWindowWidth} from '../../shared/Helpers';
import {setDatabaseEndpoint} from '../project/projects.slice';
import splashscreenStyles from './splashscreen.styles';

const Splashscreen = (props) => {
  const windowDimensions = useWindowDimensions();

  const fontSize = getFontSizeByWindowWidth(windowDimensions, 40);
  const titleStyles = [splashscreenStyles.title, {fontSize}];

  const dispatch = useDispatch();
  const customDatabaseEndpoint = useSelector(state => state.project.databaseEndpoint);

  const renderCustomEndpointEntry = () => {

    return (
      <View style={splashscreenStyles.customEndpointContainer}>
        <Text style={splashscreenStyles.customEndpointText}>Use Custom Endpoint?</Text>
        <View style={{alignItems: 'center', flexDirection: 'row', margin: 20, width: 300, height: 50}}>
          <Switch
            value={customDatabaseEndpoint.isSelected}
            onValueChange={value => dispatch(setDatabaseEndpoint({...customDatabaseEndpoint, isSelected: value}))}
          />
          <TextInput
            value={customDatabaseEndpoint.url}
            onChangeText={value => dispatch(setDatabaseEndpoint({...customDatabaseEndpoint, url: value}))}
            autoCapitalize={false}
            placeholder={'i.e. http://192.168.x.xxx'}
            style={{
              textAlign: 'center',
              height: 40,
              width: 200,
              backgroundColor: 'white',
              marginLeft: 10,
              borderWidth: 1,
              borderRadius: 20,
              padding: 0,
            }}/>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('../../assets/images/splashscreen-1.jpeg')}
        style={splashscreenStyles.backgroundImage}
      >
        <View style={splashscreenStyles.wifiIndicatorContainer}>
          {Platform.OS === 'ios' && <BatteryInfo/>}
          <ConnectionStatus/>
        </View>
        <View style={splashscreenStyles.contentContainer}>
          <View style={splashscreenStyles.titleContainer}>
            <Text style={titleStyles}>StraboSpot 2</Text>
          </View>
          {props.children}
        </View>
        <View style={{margin: 20}}>
          {/*<Text style={splashscreenStyles.version}>Dimensions H: {windowDimensions.height},*/}
          {/*  W: {windowDimensions.width} </Text>*/}
          <View>
            {renderCustomEndpointEntry()}
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Splashscreen;
