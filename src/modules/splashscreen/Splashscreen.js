import React from 'react';
import {ImageBackground, KeyboardAvoidingView, Platform, Text, useWindowDimensions, View} from 'react-native';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatus from '../../services/ConnectionStatus';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {getFontSizeByWindowWidth} from '../../shared/Helpers';
import splashscreenStyles from './splashscreen.styles';

const Splashscreen = (props) => {
  const windowDimensions = useWindowDimensions();

  const fontSize = getFontSizeByWindowWidth(windowDimensions, 40);
  const titleStyles = [splashscreenStyles.title, {fontSize}];
  const screenSizeTitle = windowDimensions.width <= 900 ? '(Phone)' : '';


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
        <Text style={splashscreenStyles.version}>v{VERSION_NUMBER} {screenSizeTitle}</Text>
        {/*<Text style={splashscreenStyles.version}>Dimensions H: {windowDimensions.height},*/}
        {/*  W: {windowDimensions.width} </Text>*/}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Splashscreen;
