import React from 'react'
import {View, StyleSheet, TextInput, Button, Alert, ImageBackground} from 'react-native'
import {goHome, goSignUp} from '../Navigation'
import {authenticateUser} from '../user/UserAuth';
import {backgroundImage} from '../../assets/background.jpg';
import ButtonWithBackground from '../ui/ButtonWithBackground';
import Icon from "react-native-vector-icons/Ionicons";

export default class SignIn extends React.Component {



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
        <TextInput
          style={styles.input}
          placeholder='Username'
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor='#6a777e'
          onChangeText={val => this.setState({username: val.toLowerCase()})}
          value={this.state.username}
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          autoCapitalize="none"
          secureTextEntry={true}
          placeholderTextColor='#6a777e'
          onChangeText={val => this.setState({password: val})}
          value={this.state.password}
        />
        <View style={styles.button}>

        <ButtonWithBackground
          color={"#407ad9"}
          onPress={this.signIn}
          style={styles.buttonText}
        >Sign In
        </ButtonWithBackground>
        <ButtonWithBackground
          color={"#407ad9"}
          onPress={this.createAccount}
        >Create an Account
        </ButtonWithBackground>
        </View>
      </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: 18,
    fontWeight: '500',
    height: 55,
    backgroundColor: 'white',
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