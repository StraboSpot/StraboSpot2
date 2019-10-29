import React from 'react'
import {View, StyleSheet, TextInput, Button, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native'
import {goHome, goSignUp} from '../routes/Navigation'
import {connect} from 'react-redux';
import {authenticateUser} from '../services/user/UserAuth';
import ButtonWithBackground from '../shared/ui/ButtonWithBackground';
import * as RemoteServer from '../services/Remote-server.factory';
import * as themes from '../shared/styles.constants';
import {USER_DATA, USER_IMAGE} from '../services/user/User.constants';
import {PASSWORD_TEST, USERNAME_TEST} from "../Config";
import {isEmpty, readDataUrl} from "../shared/Helpers";

const base64 = require('../../node_modules/base-64/base64');

let user = null;
class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: USERNAME_TEST,
      password: PASSWORD_TEST,
    };
  }

  componentDidMount() {
    if (!isEmpty(this.props.userData)) {
      goHome()
    }
  }
  guestSignIn = () => {
    goHome()
  };

  signIn = async () => {
    const {username, password} = this.state;
    user = await authenticateUser(username, password);
    try {
      // login with provider
      if (user === 'true') {
        user = {
          email: username,
          encoded_login: base64.encode(username + ':' + password)
        };
        this.updateUserResponse().then(() => {
          console.log(`${user.email} is successfully logged in!`);
          goHome()
        })
        // goHome();
      }
      else {
        Alert.alert("Login Failure", "Incorrect username and/or password");
        this.setState({password: ''});
      }
    } catch (err) {
      console.log('error:', err);
    }
  };

  updateUserResponse = async () => {
    const userProfile = await RemoteServer.getProfile(user.encoded_login);
    const userProfileImage = await RemoteServer.getProfileImage(user.encoded_login);
    if (userProfileImage.data) {
      readDataUrl(userProfileImage, (base64Image) => {
        this.props.setUserImage(base64Image);
      });
      this.props.setUserData(userProfile);
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
            <View style={{alignItems: 'center'}}>
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
                  title={'Sign In'}
                  // color={"#407ad9"}
                  onPress={() => this.signIn()}
                  name={"ios-log-in"}
                />
                <ButtonWithBackground
                  title={'Create an Account'}
                  // color={"#407ad9"}
                  onPress={() => this.createAccount()}
                  name={"ios-add"}
                />
                <ButtonWithBackground
                  title={'Continue as Guest'}
                  // color={"#407ad9"}
                  onPress={() => this.guestSignIn()}
                  name={"ios-people"}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userData: state.user.userData
  }
};

const mapDispatchToProps = {
  setUserData: (userData) => ({type: USER_DATA, userData: userData}),
  setUserImage: (userImage) => ({type: USER_IMAGE, userImage: userImage})
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);

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
    // marginTop: 20,
    resizeMode: 'cover'
  },
  button: {
    marginTop: 50
  }

});
