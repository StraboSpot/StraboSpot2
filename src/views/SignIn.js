import React from 'react'
import {View, StyleSheet, TextInput, Alert, ImageBackground, KeyboardAvoidingView} from 'react-native'
import {goHome, goSignUp} from '../routes/Navigation'
import {connect} from 'react-redux';
import {authenticateUser} from '../services/user/UserAuth';
import * as RemoteServer from '../services/Remote-server.factory';
import * as themes from '../shared/styles.constants';
import {USER_DATA, USER_IMAGE, ENCODED_LOGIN} from '../services/user/User.constants';
import {PASSWORD_TEST, USERNAME_TEST} from "../Config";
import * as Sentry from '@sentry/react-native';
import {isEmpty, readDataUrl} from "../shared/Helpers";
import Icon from "react-native-vector-icons/Ionicons";
import {Button} from "react-native-elements";
import NetInfo from "@react-native-community/netinfo";
import {homeReducers} from "./home/Home.constants";
import IconButton from "../shared/ui/IconButton";

const base64 = require('../../node_modules/base-64/base64');

let user = null;
class SignIn extends React.Component {
  online = require('../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_connected.png');
  offline = require('../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_offline.png');
  constructor(props) {
    super(props);
    this.state = {
      username: USERNAME_TEST,
      password: PASSWORD_TEST,
    };
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    if (!isEmpty(this.props.userData)) {
      console.log('Loading user:', this.props.userData.name);
      goHome()
    }
  }

  //function for online/offline state change event handler
  handleConnectivityChange = (isConnected) => {
    this.props.setIsOnline(isConnected);
  };

  guestSignIn = () => {
    Sentry.configureScope((scope) => {
      scope.setUser({'id': 'GUEST'})
    });
    console.log('Loading user: GUEST');
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
        this.props.setEncodedLogin(user.encoded_login);
        this.updateUserResponse().then(() => {
          console.log(`${user.email} is successfully logged in!`);
          Sentry.configureScope((scope) => {
            scope.setUser({'email': user.email})
          });
          goHome()
        })
      }
      else {
        Alert.alert("Login Failure", "Incorrect username and/or password");
        this.setState({password: ''});
      }
    } catch (err) {
      console.log('error:', err);
    }
  };

  renderButtons = () => {
      return (
        <View>
          <Button
            icon={
              <Icon
                style={styles.icon}
                name={"ios-log-in"}
                size={30}
                color={"white"}/>
            }
            type={'solid'}
            containerStyle={{marginTop: 30}}
            onPress={() => this.signIn()}
            buttonStyle={styles.buttonStyle}
            disabled={!this.props.isOnline}
            title={'Sign In'}
          />
          <Button
            icon={
              <Icon
                style={styles.icon}
                name={"ios-add"}
                size={30}
                color={"white"}/>
            }
            type={'solid'}
            containerStyle={{marginTop: 10}}
            onPress={() => this.createAccount()}
            buttonStyle={styles.buttonStyle}
            disabled={!this.props.isOnline}
            title={'Create an Account'}
          />
          <Button
            icon={
              <Icon
                style={styles.icon}
                name={"ios-people"}
                size={30}
                color={"white"}/>
            }
            type={'solid'}
            onPress={() => this.guestSignIn()}
            containerStyle={{marginTop: 10}}
            buttonStyle={styles.buttonStyle}
            title={'Continue as Guest'}
          />
        </View>
      )
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
          <View style={{
            position: 'absolute',
            right: 0,
            top: 40,
            zIndex: -1}}>
          <IconButton
            source={this.props.isOnline ? this.online : this.offline}
          />
          </View>
          <KeyboardAvoidingView
            behavior={'padding'}
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'space-between'
            }}
            keyboardVerticalOffset={150}
          >
            <View style={{alignItems: 'center'}}>
              <View style={styles.signInContainer}>
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
                {this.renderButtons()}
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
    userData: state.user.userData,
    isOnline: state.home.isOnline
  }
};

const mapDispatchToProps = {
  setIsOnline: (online) => ({type: homeReducers.SET_ISONLINE, online: online}),
  setUserData: (userData) => ({type: USER_DATA, userData: userData}),
  setEncodedLogin: (value) => ({type: ENCODED_LOGIN, value: value}),
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
  signInContainer: {
    // marginTop: 30,
    alignItems: 'center',
  },
  buttonStyle: {
    borderRadius: 30,
    paddingRight: 50,
    paddingLeft: 50
  },
  icon: {
    paddingRight: 15
  }

});
