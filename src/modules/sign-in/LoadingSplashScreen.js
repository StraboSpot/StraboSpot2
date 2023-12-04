import React from 'react';
import {Platform, Text, View} from 'react-native';

import {BallIndicator} from 'react-native-indicators';

import signInStyles from './signIn.styles';

const LoadingSplashScreen = () => {
  return (
    <View style={signInStyles.loadingSplashScreenContainer}>
      <View>
        {Platform.OS === 'web' &&  <Text style={signInStyles.loadingSplashScreenText}>Getting Project Details...</Text>}
        <BallIndicator
          color={'darkgrey'}
          count={8}
          size={60}
        />
      </View>
    </View>
  );
};

export default LoadingSplashScreen;
