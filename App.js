import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Sentry from '@sentry/react-native';

Sentry.init({ 
  dsn: 'https://69a20374397e4b43af63a8a93e456e25@sentry.io/1783328', 
});


export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
