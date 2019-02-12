import React, {Component} from 'react'
import {
  Image,
  Text,
  StyleSheet,
  View} from 'react-native'
import {goToAuth, goSignIn} from './routes/Navigation'
import splash from "./assets/images/splash.png";

export default class Initialising extends Component {

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