import React from 'react';
import {ImageBackground, Platform, ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {useSelector} from 'react-redux';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatus from '../../services/ConnectionStatus';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {getFontSizeByWindowWidth} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';
import splashscreenStyles from './splashscreen.styles';

const Splashscreen = (props) => {
  const windowDimensions = useWindowDimensions();
  const screenSizeTitle = windowDimensions.width <= 900 ? '(Phone)' : '';

  const fontSize = getFontSizeByWindowWidth(windowDimensions, 40);
  const titleStyles = [splashscreenStyles.title, {fontSize}];

  const loading = useSelector(state => state.home.loading.home);

  return (
    <ImageBackground
      source={require('../../assets/images/splashscreen-1.jpeg')}
      style={splashscreenStyles.backgroundImage}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        style={{flex: 1}}
      >
        <View style={splashscreenStyles.wifiIndicatorContainer}>
          {Platform.OS === 'ios' && <BatteryInfo/>}
          <ConnectionStatus/>
        </View>
        <View style={splashscreenStyles.contentContainer}>
          <View style={splashscreenStyles.titleContainer}>
            <Text style={titleStyles}>StraboSpot 2</Text>
            <Text style={splashscreenStyles.versionNumber}>v{VERSION_NUMBER} {screenSizeTitle}</Text>
          </View>
          {props.children}
        </View>
        <View style={{margin: 20}}>
          {/*<Text style={splashscreenStyles.versionNumber}>Dimensions H: {windowDimensions.height},*/}
          {/*  W: {windowDimensions.width} </Text>*/}
        </View>
      </ScrollView>
      <Loading
        isLoading={loading}
        size={60}
      />
    </ImageBackground>
  );
};

export default Splashscreen;
