import React, {useState} from 'react';
import {View, Text} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Avatar} from 'react-native-elements';
import {connect, useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import userStyles from './user.styles';

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const openUploadAndBackupPage = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(
        {type: mainMenuPanelReducers.SET_MENU_SELECTION_PAGE, name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT});
    }, 200);
  };

  const doLogOut = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      props.clearStorage();
      navigation.navigate('SignIn');
    }, 200);
  };

  const getUserInitials = () => {
    const name = props.userData.name;
    let initials = name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    console.log(initials);
    return initials;
  };

  const renderAvatarImageBlock = () => {
    if (!isEmpty(props.userData)) {
      if (!isEmpty(props.userData.image)) {
        return (
          <View style={userStyles.profileNameAndImageContainer}>
            <View style={userStyles.avatarImageContainer}>
              <Avatar
                // containerStyle={userStyles.avatarImage}
                source={{uri: props.userData.image}}
                showEditButton={false}
                rounded={true}
                size={70}
                onPress={() => console.log(props.userData.name)}
              />
            </View>
            <View style={userStyles.avatarLabelContainer}>
              <Text style={userStyles.avatarLabelName}>{props.userData.name}</Text>
              <Text style={userStyles.avatarLabelEmail}>{props.userData.email}</Text>
            </View>
          </View>
        );
      }
      else if (isEmpty(props.userData.image)) {
        return (
          <View style={userStyles.profileNameAndImageContainer}>
            <View style={userStyles.avatarImageContainer}>
              <Avatar
                // source={require('../../assets/images/noimage.jpg')}
                title={props.userData.name && props.userData.name !== '' && getUserInitials()}
                source={props.userData.name === '' ? require('../../assets/images/splash.png') : null}
                showEditButton={true}
                rounded={true}
                size={70}
                onPress={() => console.log('User with no image')}
              />
            </View>
            <View style={userStyles.avatarLabelContainer}>
              <Text style={userStyles.avatarLabelName}>{props.userData.name}</Text>
              <Text style={userStyles.avatarLabelEmail}>{props.userData.email}</Text>
            </View>
          </View>
        );
      }
    }
    else {
      return (
        <View style={userStyles.profileNameAndImageContainer}>
          <View style={userStyles.avatarImageContainer}>
            <Avatar
              icon={isEmpty(props.userData) ? {name: 'user', type: 'font-awesome'} : null}
              showEditButton={false}
              rounded={true}
              size={70}
              onPress={() => console.log('GUEST')}
            />
          </View>
          <View style={userStyles.avatarLabelContainer}>
            <Text style={userStyles.avatarLabelName}>Guest</Text>
          </View>
        </View>
      );
    }

  };

  const renderLogOutButton = () => {
    return (
      <View>
        <Button
          onPress={() => setIsLogoutModalVisible(true)}
          title={'Log out'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        {isEmpty(props.userData)
        && <Button
          onPress={() => navigation.navigate('SignIn')}
          title={'Go To Sign In'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />}
      </View>
    );
  };

  const renderLogoutModal = () => {
    return (
      <StandardModal
        visible={isLogoutModalVisible}
        dialogTitle={'Log Out?'}
        dialogTitleStyle={commonStyles.dialogWarning}>
        <Text style={commonStyles.dialogConfirmText}>Logging out will
          <Text
            style={commonStyles.dialogContentImportantText}>ERASE</Text> local data. Please make sure you saved changes
          to the server or device?
        </Text>
        <Button
          title={'Backup'}
          type={'clear'}
          containerStyle={commonStyles.buttonContainer}
          onPress={() => openUploadAndBackupPage()}/>
        <Button title={'Logout'}
                titleStyle={commonStyles.dialogContentImportantText}

                onPress={() => doLogOut()}
                type={'clear'}
                containerStyle={commonStyles.buttonContainer}/>
        <Button
          title={'Cancel'}
          onPress={() => setIsLogoutModalVisible(false)} type={'clear'}
          containerStyle={commonStyles.buttonContainer}/>
      </StandardModal>
    );
  };

  return (
    <React.Fragment>
      <View style={userStyles.profileContainer}>
        {renderAvatarImageBlock()}
        {renderLogOutButton()}
        {renderLogoutModal()}
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    userData: state.user,
  };
};

const mapDispatchToProps = {
  clearStorage: () => ({type: 'CLEAR_STORE'}),
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
