import React from 'react'
import {View, StyleSheet, TextInput, Button, Alert} from 'react-native'
import {goHome, goSignUp} from '../navigation'
import {authenticateUser} from '../user/UserAuth';

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
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='Username'
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor='white'
          onChangeText={val => this.setState({username: val.toLowerCase()})}
          value={this.state.username}
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          autoCapitalize="none"
          secureTextEntry={true}
          placeholderTextColor='white'
          onChangeText={val => this.setState({password: val})}
          value={this.state.password}
        />
        <Button
          title='Sign In'
          onPress={this.signIn}
        />
        <Button
          title='Create account'
          onPress={this.createAccount}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: 18,
    fontWeight: '500',
    height: 55,
    backgroundColor: '#42A5F5',
    margin: 10,
    color: 'white',
    padding: 8,
    borderRadius: 14
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});