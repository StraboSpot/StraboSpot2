import React from 'react'
import {View, StyleSheet, TextInput, Button, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native'
import {goHome, goSignUp} from '../routes/Navigation'
import {authenticateUser} from '../services/user/UserAuth';
import {backgroundImage} from '../assets/images/background.jpg';
import ButtonWithBackground from '../shared/ui/ButtonWithBackground';
import Icon from "react-native-vector-icons/Ionicons";

import * as themes from '../shared/styles.constants';

export default class SignIn extends React.Component {
  // componentDidMount() {
  //   Icon.getImageSource("pin", 30)
  // }

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  signIn = async () => {
    const {username, password} = this.state;
    try {
      // login with provider
      const user = await authenticateUser(username, password);
      if (user === 'true') {
        console.log('user successfully signed in!', user);
        goHome();
      }
      else {
        Alert.alert("Login Failure", "Incorrect username and/or password");
        this.setState({password: ''});
      }
    } catch (err) {
      console.log('error:', err);
    }
  };

  createAccount = () => {
    goSignUp();
  };

  render() {
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            behavior={'padding'}
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'space-between'
            }}
            keyboardVerticalOffset={150}
          >
            <TextInput
              style={styles.input}
              placeholder='Username'
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor='#6a777e'
              onChangeText={val => this.setState({username: val.toLowerCase()})}
              value={this.state.username}
              keyboardType="email-address"
              returnKeyType="go"
            />
            <TextInput
              style={styles.input}
              placeholder='Password'
              autoCapitalize="none"
              secureTextEntry={true}
              placeholderTextColor='#6a777e'
              onChangeText={val => this.setState({password: val})}
              value={this.state.password}
              returnKeyType="go"
              onSubmitEditing={this.signIn}
            />
            <View style={styles.button}>

              <ButtonWithBackground
                color={"#407ad9"}
                onPress={this.signIn}
                // style={styles.buttonText}
                name={"ios-log-in"}
              >Sign In
              </ButtonWithBackground>
              <ButtonWithBackground
                color={"#407ad9"}
                onPress={this.createAccount}
                name={"ios-add"}
              >Create an Account
              </ButtonWithBackground>
            </View>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 55,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 14
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    // width: null,
    // height: '100%',
    marginTop: 20,
    resizeMode: 'cover'
  },
  button: {
    marginTop: 50
  }

});
