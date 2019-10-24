import React, {Component} from 'react'
import {View, Text} from 'react-native'
import {Button} from "react-native-elements";
import {connect} from 'react-redux';
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

  render() {
    return (
      <React.Fragment>
        <View style={styles.profileContainer}>
          <View style={styles.profileNameAndImageContainer}>
            <View style={styles.avatarImageContainer}>
              <Avatar
                // containerStyle={styles.avatarImage}
                source={{uri: this.props.userProfile.image}}
                showEditButton={false}
                rounded={true}
                size={70}
                onPress={() => this.user()}
              />
            </View>
            <View style={styles.avatarLabelContainer}>
              <Text style={styles.avatarLabel}>{this.props.userProfile.name}</Text>
              {/*<Text style={styles.avatarLabel}>Norris</Text>*/}
            </View>
          </View>
          <View style={styles.projectName}>
            <Text style={styles.projectNameText}>Project</Text>
            <Button
              title={'Switch Projects'}
              type={'clear'}
              titleStyle={{fontSize: 16}}
              onPress={() => console.log('switching projects')}
            />
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

const mapStateToProps = (state) => {
  return {
    userProfile: state.user.userData
  }
};

export default connect(mapStateToProps)(UserProfileComponent);
