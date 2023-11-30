import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Avatar, Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {REDUX} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import {setMainMenuPanelVisible} from '../home/home.slice';
import overlayStyles from '../home/overlay.styles';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import userStyles from './user.styles';
import useUserProfileHook from './useUserProfile';

const UserProfile = ({logout}) => {
  const defaultAvatar = require('../../assets/images/splash.png');
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const useUserProfile = useUserProfileHook();

  const getAvatarSource = () => {
    if (!isEmpty(userData.image) && typeof userData.image.valueOf() === 'string') return {uri: userData.image};
    else if (isEmpty(userData.image) || (userData.image && typeof userData.image.valueOf() !== 'string')) {
      if ((!userData.name || userData.name === '')) return defaultAvatar;
    }
  };

  const openUploadAndBackupPage = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}));
    }, 200);
  };

  const doLogOut = (type) => {
    if (type === 'signIn') {
      dispatch(setMainMenuPanelVisible(false));
      logout()
    }
    else if (type === 'clear') {
      setIsLogoutModalVisible(false);
      setTimeout(() => { // Added timeOut cause state of modal wasn't changing fast enough
        dispatch(setMainMenuPanelVisible(false));
        dispatch({type: REDUX.CLEAR_STORE});
        logout();
      }, 200);
    }
  };

  const renderAvatarImage = () => {
    return (
      <Avatar
        title={userData.name && userData.name !== '' && useUserProfile.getInitials()}
        containerStyle={{backgroundColor: 'darkgrey'}}
        titleStyle={userStyles.avatarPlaceholderTitleStyle}
        source={getAvatarSource()}
        size={70}
        rounded={true}
      />
    );
  };

  const renderProfile = () => {
    return (
      <View>
        <ListItem
          onPress={() => dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.USER_PROFILE, bool: true}))}
          disabled={isEmpty(userData.name)}
        >
          {renderAvatarImage()}
          <ListItem.Content>
            <ListItem.Title style={userStyles.avatarLabelName}>{useUserProfile.getName()}</ListItem.Title>
            <ListItem.Subtitle style={userStyles.avatarLabelEmail}>{useUserProfile.getEmail()}</ListItem.Subtitle>
          </ListItem.Content>
          {!isEmpty(userData.name) && <ListItem.Chevron/>}
        </ListItem>
      </View>
    );
  };

  const renderLogOutButton = () => {
    return (
      <View>
        <Button
          onPress={() => isEmpty(userData.name) ? doLogOut('signIn') : setIsLogoutModalVisible(true)}
          title={isEmpty(userData.name) ? 'Sign In' : 'Log out'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        {isEmpty(userData.name)
          && (
            <Button
              onPress={() => doLogOut('clear')}
              title={isEmpty(userData.name) && 'Clear and Return to Sign In'}
              containerStyle={commonStyles.standardButtonContainer}
              buttonStyle={commonStyles.standardButton}
              titleStyle={commonStyles.standardButtonText}
            />
          )}
      </View>
    );
  };

  const renderLogoutModal = () => {
    return (
      <StandardModal
        visible={isLogoutModalVisible}
        dialogTitle={'Log Out?'}
      >
        <Text style={overlayStyles.statusMessageText}>
          Logging out will
          <Text style={overlayStyles.importantText}> ERASE </Text>
          local data. Please make sure you saved changes to the server or device.
        </Text>
        <View style={overlayStyles.buttonContainer}>
          <Button
            title={'Backup'}
            type={'clear'}
            onPress={() => openUploadAndBackupPage()}/>
          <Button
            title={'Logout'}
            titleStyle={overlayStyles.importantText}
            onPress={() => doLogOut('clear')}
            type={'clear'}
          />
        </View>
        <Button
          title={'Cancel'}
          onPress={() => setIsLogoutModalVisible(false)} type={'clear'}
          containerStyle={overlayStyles.buttonContainer}/>
      </StandardModal>
    );
  };

  return (
    <React.Fragment>
      <View>
        {renderProfile()}
        {Platform.OS !== 'web' && (
          <>
            {renderLogOutButton()}
            {renderLogoutModal()}
          </>
        )}
      </View>
    </React.Fragment>
  );
};

export default UserProfile;
