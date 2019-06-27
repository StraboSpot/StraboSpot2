import React from 'react'
import {View, Button, TextInput, StyleSheet} from 'react-native'
import {goHome} from "../routes/Navigation";

import * as themes from '../shared/styles.constants';

export default class SignUp extends React.Component {
  state = {
    username: '', password: '', email: '', phone_number: ''
  };

  onChangeText = (key, val) => {
    this.setState({ [key]: val })
  };

  signUp = async () => {
    const { username, password, email, phone_number } = this.state;
    try {
      console.log('user successfully signed up!: ');
      goHome();
    } catch (err) {
      console.log('error signing up: ', err)
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='Username'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => this.onChangeText('username', val)}
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          secureTextEntry={true}
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => this.onChangeText('password', val)}
        />
        <TextInput
          style={styles.input}
          placeholder='Email'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => this.onChangeText('email', val)}
        />
        <TextInput
          style={styles.input}
          placeholder='Phone Number'
          autoCapitalize="none"
          placeholderTextColor='white'
          onChangeText={val => this.onChangeText('phone_number', val)}
        />
        <Button
          title='Sign Up'
          onPress={this.signUp}
        />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  input: {
    width: 350,
    height: 55,
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
    margin: 10,
    padding: 8,
    color: 'white',
    borderRadius: 14,
    fontSize: 18,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});