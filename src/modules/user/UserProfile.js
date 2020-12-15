import React, {useState} from 'react';
import {View, Text} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Avatar} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {REDUX} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import userStyles from './user.styles';

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);
  const navigation = useNavigation();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const openUploadAndBackupPage = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}));
    }, 200);
  };

  const doLogOut = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      props.logout();
      dispatch({type: REDUX.CLEAR_STORE});
      navigation.navigate('SignIn');
    }, 200);
  };

  const getUserInitials = () => {
    return userData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const renderAvatarImageBlock = () => {
    if (!isEmpty(userData)) {
      if (!isEmpty(userData.image) && typeof userData.image.valueOf() === 'string') {
        return (
          <View style={userStyles.profileNameAndImageContainer}>
            <View>
              <Avatar
                source={{uri: userData.image}}
                rounded={true}
                size={70}
                onPress={() => console.log(userData.name)}
              />
            </View>
            <View style={userStyles.avatarLabelContainer}>
              <Text style={userStyles.avatarLabelName}>{userData.name}</Text>
              <Text style={userStyles.avatarLabelEmail}>{userData.email}</Text>
            </View>
          </View>
        );
      }
      else if (isEmpty(userData.image) || (userData.image && typeof userData.image.valueOf() !== 'string')) {
        return (
          <View style={userStyles.profileNameAndImageContainer}>
            <Avatar
              title={userData.name && userData.name !== '' && getUserInitials()}
              titleStyle={userStyles.avatarPlaceholderTitleStyle}
              source={(!userData.name || userData.name === '') && require('../../assets/images/noimage.jpg')}
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
              icon={isEmpty(userData) && {name: 'user', type: 'font-awesome'}}
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
        {isEmpty(userData)
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
            style={commonStyles.dialogContentImportantText}> ERASE </Text>local data. Please make sure you saved changes
          to the server or device.
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
