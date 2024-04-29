import React from 'react';
import {ImageBackground, Platform, ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {useSelector} from 'react-redux';

import splashScreenStyles from './splashScreen.styles';
import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import VersionCheckLabel from '../../services/versionCheck/VersionCheckLabel';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {getFontSizeByWindowWidth} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';

const SplashScreen = ({children}) => {
  const {width, height} = useWindowDimensions();

  const fontSize = getFontSizeByWindowWidth({width, height}, 40);
  const titleStyles = [splashScreenStyles.title, {fontSize}];

  const loading = useSelector(state => state.home.loading.home);

  return (
    <ImageBackground
      source={require('../../assets/images/splash-screen.jpeg')}
      style={splashScreenStyles.backgroundImage}>
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={{flex: 1}}>
        <View style={splashScreenStyles.wifiIndicatorContainer}>
          {Platform.OS === 'ios' && <BatteryInfo/>}
          <ConnectionStatusIcon/>
        </View>
        <View style={splashScreenStyles.contentContainer}>
          <View style={splashScreenStyles.titleContainer}>
            <Text style={titleStyles}>StraboSpot 2</Text>
            <Text style={splashScreenStyles.versionNumber}>
              v{VERSION_NUMBER}
            </Text>
          </View>
          {children}
        </View>
        <View style={{ marginVertical: 100}}>
          <VersionCheckLabel/>
        </View>
        {!__DEV__ && (
          <View style={splashScreenStyles.dimensionsContainer}>
            <Text style={splashScreenStyles.dimensionsText}>
              Screen Dimensions
            </Text>
            <Text style={splashScreenStyles.dimensionsText}>
              {' '}
              H: {height.toFixed(0)}{' '}
            </Text>
            <Text style={splashScreenStyles.dimensionsText}>
              W: {width.toFixed(0)}{' '}
            </Text>
          </View>
        )}
      </ScrollView>
      <Loading isLoading={loading} size={60}/>
    </ImageBackground>
  );
};

export default SplashScreen;
