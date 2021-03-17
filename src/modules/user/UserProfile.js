import React, {useState} from 'react';
import {View, Text} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {REDUX} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import {setSignedInStatus} from '../home/home.slice';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import userStyles from './user.styles';
import useUserProfileHook from './useUserProfile';

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const navigation = useNavigation();
  const useUserProfile = useUserProfileHook();

  const openUploadAndBackupPage = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}));
    }, 200);
  };

  const doLogOut = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => { // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(setSignedInStatus(false));
      dispatch({type: REDUX.CLEAR_STORE});
      props.logout();
      navigation.navigate('SignIn', userData);
    }, 200);
  };

  const renderAvatarImageBlock = () => {
    if (!isEmpty(userData.name || userData.image)) {
      if (!isEmpty(userData.image) && typeof userData.image.valueOf() === 'string') {
        return (
          <View>
            <ListItem
              onPress={() => dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.USER_PROFILE, bool: true}))}
            >
              <Avatar
                source={{uri: userData.image}}
                size={70}
                rounded={true}
              />
              <ListItem.Content>
                <ListItem.Title style={userStyles.avatarLabelName}>{userData.name}</ListItem.Title>
                <ListItem.Subtitle style={userStyles.avatarLabelEmail}>{truncateText(userData.email,
                  16)}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron/>
            </ListItem>
          </View>
        );
      }
      else if (isEmpty(userData.image) || (userData.image && typeof userData.image.valueOf() !== 'string')) {
        return (
          <View style={userStyles.profileNameAndImageContainer}>
            <Avatar
              title={userData.name && userData.name !== '' && useUserProfile.getUserInitials()}
              titleStyle={userStyles.avatarPlaceholderTitleStyle}
              source={(!userData.name || userData.name === '') && require('../../assets/images/splash.png')}
              rounded={true}
              size={70}
              onPress={() => console.log('User with no image')}
            />
            <View style={userStyles.avatarLabelContainer}>
              <Text style={userStyles.avatarLabelName}>{userData.name}</Text>
              <Text style={userStyles.avatarLabelEmail}>{userData.email}</Text>
            </View>
          </View>
        );
      }
    }
    else {
      return (
        <View style={userStyles.profileNameAndImageContainer}>
          <View>
            <Avatar
              source={require('../../assets/images/splash.png')}
              rounded={true}
              size={70}
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
        {isEmpty(userData.name)
          ? <Button
            onPress={() => navigation.navigate('SignIn')}
            title={'Sign In'}
            containerStyle={commonStyles.standardButtonContainer}
            buttonStyle={commonStyles.standardButton}
            titleStyle={commonStyles.standardButtonText}
          />
          : <Button
            onPress={() => setIsLogoutModalVisible(true)}
            title={'Log out'}
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
        <Text style={commonStyles.dialogConfirmText}>
          Logging out will
          <Text style={commonStyles.dialogContentImportantText}> ERASE </Text>
          local data. Please make sure you saved changes to the server or device.
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
      <View>
        {renderAvatarImageBlock()}
        {renderLogOutButton()}
        {renderLogoutModal()}
      </View>
    </React.Fragment>
  );
};

export default UserProfile;
