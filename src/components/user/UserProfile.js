import React from 'react';
import {View, Text} from 'react-native';
import {Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {Avatar} from 'react-native-elements';
import {withNavigation} from 'react-navigation';

import {isEmpty} from '../../shared/Helpers';

// Styles
import commonStyles from '../../shared/common.styles';
import userStyles from './user.styles';

const UserProfile = (props) => {

  const doLogOut = async () => {
    if (!isEmpty(props.userData)) await props.clearStorage();
    props.navigation.navigate('SignIn');
  };

  const renderAvatarImageBlock = () => {
    let avatarImage = null;
    if (props.userData.image) {
      avatarImage = (
        <Avatar
          // containerStyle={userStyles.avatarImage}
          source={{uri: props.userData.image}}
          showEditButton={false}
          rounded={true}
          size={70}
          onPress={() => console.log(props.userData.name)}
        />
      );
    }
    else {
      avatarImage = (
        <Avatar
          // containerStyle={userStyles.avatarImage}
          icon={{name: 'user', type: 'font-awesome'}}
          showEditButton={false}
          rounded={true}
          size={70}
          onPress={() => console.log('GUEST')}
        />
      );
    }
    return (
      <View style={userStyles.profileNameAndImageContainer}>
        <View style={userStyles.avatarImageContainer}>
          {avatarImage}
        </View>
        <View style={userStyles.avatarLabelContainer}>
          <Text style={userStyles.avatarLabelName}>{props.userData.name ? props.userData.name : 'Guest'}</Text>
          {props.userData.email && <Text style={userStyles.avatarLabelEmail}>{props.userData.email}</Text>}
        </View>
      </View>
    );
  };

  const renderLogOutButton = () => {
    return (
      <Button
        onPress={() => doLogOut()}
        title={'Log out'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
    );
  };

  return (
    <React.Fragment>
      <View style={userStyles.profileContainer}>
        {renderAvatarImageBlock()}
        {renderLogOutButton()}
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    userData: state.user.userData,
  };
};

const mapDispatchToProps = {
  clearStorage: () => ({type: 'USER_LOGOUT'}),
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(UserProfile));
