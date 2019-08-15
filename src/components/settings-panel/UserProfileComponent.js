import React, {Component} from 'react'
import {View, Text} from 'react-native'
// import {getUserProfile} from '../services/user/UserProfile';
import {Avatar} from 'react-native-elements';
import styles from './SettingsPanelStyles';

class UserProfileComponent extends Component {
constructor(props) {
  super(props);
  this.state ={
    username: '',
    userImage: '',
    MB_Token: ''
  }
}

  user = async (username) => {
    const baseUrl = 'https://strabospot.org/db';

    const userProfileBaseUrl = baseUrl + '/profile';
    console.log(userProfileBaseUrl);
    try {
      let response = await fetch(userProfileBaseUrl + '/profile');
      console.log(response);
    } catch (e) {
      console.log("Error", e)
    }
  };

  render() {
    return (
      <React.Fragment>
        <View style={styles.profileContainer}>
          <View style={styles.profileNameAndImageContainer}>
            <View style={styles.avatarImageContainer}>
              <Avatar
                // containerStyle={styles.avatarImage}
                source={require('../../assets/images/Chuck-norris.jpg')}
                showEditButton={false}
                rounded={true}
                size={65}
                onPress={() => this.user()}
              />
            </View>
            <View style={styles.avatarLabelContainer}>
              <Text style={styles.avatarLabel}>Chuck</Text>
              <Text style={styles.avatarLabel}>Norris</Text>
            </View>
          </View>
          <View style={styles.projectName}>
            <Text style={styles.projectNameText}>Project</Text>
          </View>
          {/*<Button*/}
          {/*  title={"User"}*/}
          {/*  onPress={this.user}*/}
          {/*/>*/}
        </View>
      </React.Fragment>
    )
  }
}

export default UserProfileComponent;
