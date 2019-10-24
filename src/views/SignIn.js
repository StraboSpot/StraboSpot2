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
import {isEmpty} from "../shared/Helpers";

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
        console.log(`${user.email} is successfully logged in!`);
        this.updateUser().then(() => goHome())
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

  updateUser = async () => {
    RemoteServer.getProfile(user.encoded_login).then((profileResponse) => {
      console.log('Profile Res', profileResponse);
      this.props.setUserData(profileResponse);
      RemoteServer.getProfileImage(user.encoded_login).then((profileImageResponse) => {
        console.log('Profile Image Res', profileImageResponse);
        if (profileImageResponse.data) {
          this.readDataUrl(profileImageResponse, async (base64Image) => {
            this.props.setUserImage(base64Image)
          })
        }
      })
    });
  };

  readDataUrl = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = function (evt) {
      // console.log(evt.target.result);
      callback(evt.target.result);
      };
    reader.readAsDataURL(file);
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
    marginTop: 20,
    resizeMode: 'cover'
  },
  button: {
    marginTop: 50
  }

});
