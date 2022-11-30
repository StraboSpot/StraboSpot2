import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  Platform
} from 'react-native';

import Animated from 'react-native-reanimated';

const App = () => {
  console.log(Platform.OS);
  return (
    <SafeAreaView>
      <StatusBar barStyle='dark-content' />
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 24}}>React Native Web App Example!</Text>
        <Animated.Image
          source={require('./src/assets/images/noimage.jpg')}
          resizeMode='contain'
          style={{ width: 100, height: 200 }}
        />
      </View>
    </SafeAreaView>
  );
};
export default App;
