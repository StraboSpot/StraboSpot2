import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {goToAuth, goSignIn} from './navigation'

export default class Initialising extends React.Component {

  async componentDidMount() {
    goSignIn();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Loading</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 28
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});