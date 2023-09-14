import React from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {useSelector} from 'react-redux';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import VersionCheckLabel from '../../services/versionCheck/VersionCheckLabel';
import {VERSION_NUMBER} from '../../shared/app.constants';
import {getFontSizeByWindowWidth} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';
import splashscreenStyles from './splashscreen.styles';

const Splashscreen = (props) => {
  const windowDimensions = useWindowDimensions();

  const fontSize = getFontSizeByWindowWidth(windowDimensions, 40);
  const titleStyles = [splashscreenStyles.title, {fontSize}];

  const loading = useSelector((state) => state.home.loading.home);

  return (
    <ImageBackground
      source={require('../../assets/images/splashscreen-1.jpeg')}
      style={splashscreenStyles.backgroundImage}>
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={{flex: 1}}>
        <View style={splashscreenStyles.wifiIndicatorContainer}>
          {Platform.OS === 'ios' && <BatteryInfo />}
          <ConnectionStatusIcon />
        </View>
        <View style={splashscreenStyles.contentContainer}>
          <View style={splashscreenStyles.titleContainer}>
            <Text style={titleStyles}>StraboSpot 2</Text>
            <Text style={splashscreenStyles.versionNumber}>
              v{VERSION_NUMBER}
            </Text>
          </View>
          {props.children}
        </View>
        {__DEV__ && (
          <View style={splashscreenStyles.dimensionsContainer}>
            <Text style={splashscreenStyles.dimensionsText}>
              Screen Dimensions
            </Text>
            <Text style={splashscreenStyles.dimensionsText}>
              {' '}
              H: {windowDimensions.height.toFixed(0)}{' '}
            </Text>
            <Text style={splashscreenStyles.dimensionsText}>
              W: {windowDimensions.width.toFixed(0)}{' '}
            </Text>
          </View>
        )}
      </ScrollView>
      <Loading isLoading={loading} size={60}/>
      <VersionCheckLabel />
    </ImageBackground>
  );
};

export default Splashscreen;
