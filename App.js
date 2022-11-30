import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  Platform
} from 'react-native';

const App = () => {
  console.log(Platform.OS);
  return (
    <SafeAreaView>
      <StatusBar barStyle='dark-content' />
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 24}}>React Native Web App Example!</Text>
      </View>
    </SafeAreaView>
  );
};
export default App;
