import React, {Component} from 'react'
import {View, StyleSheet, TextInput, Button, Alert, ImageBackground, Text} from 'react-native'
import ButtonNoBackground from '../ui/ButtonNoBackround';
import {goSignIn} from "../routes/Navigation";
import {getUserProfile} from '../services/user/UserProfile';

class UserProfileComponent extends Component {
constructor(props) {
  super(props);
  this.state ={
    username: '',
    userImage: '',
    MB_Token: ''
  }
}

 async componentWillMount() {
  // const {username, MB_Token} = this.state;
  // try{
  //   let userData = await getUserProfile(username, MB_Token);
  //   console.log(userData)
  // }
  // catch (err) {
  //   console.log(err)
  // }

}

  user = async (username) => {
    const baseUrl = 'https://strabospot.org/db';

    const userProfileBaseUrl = baseUrl + '/profile';
    console.log(userProfileBaseUrl);
    try {
      let response = await fetch(userProfileBaseUrl + '/profile');
      console.log(response);
    }
    catch (e) {
      console.log("Error", e)
    }
  };

  render () {
  return (
    <React.Fragment>
      <Text>Profile</Text>
      <ButtonNoBackground
        style={styles.profileButtons}
        onPress={() => goSignIn()}
        name={"ios-home"}
      >
        Home
      </ButtonNoBackground>
    <Button
      title={"User"}
      onPress={this.user}
    />
    </React.Fragment>
  )
}
}

const styles = StyleSheet.create({
  profileButtons: {
    alignItems: 'flex-end',
    marginTop: 20
  },
  userButton: {
    alignItems: 'flex-end',
    marginTop: 10
  }
});

export default UserProfileComponent;
