import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import userStyles from './user.styles';
import {logout} from './userProfile.slice';
import UserProfileAvatar from './UserProfileAvatar';
import useUserProfileHook from './useUserProfile';
import useResetState from '../../services/useResetState';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import overlayStyles from '../home/overlays/overlay.styles';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const {clearUser} = useResetState();
  const useUserProfile = useUserProfileHook();

  const openUploadAndBackupPage = () => {
    setIsLogoutModalVisible(false);
    setTimeout(() => {          // Added timeOut cause state of modal wasn't changing fast enough
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT}));
    }, 200);
  };

  const renderProfile = () => {
    return (
      <View>
        <ListItem
          onPress={() => dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.USER_PROFILE, bool: true}))}
          disabled={isEmpty(userData.name)}
        >
          <UserProfileAvatar size={70}/>
          <ListItem.Content>
            <ListItem.Title style={userStyles.avatarLabelName}>{useUserProfile.getName()}</ListItem.Title>
            <ListItem.Subtitle style={userStyles.avatarLabelEmail}>{useUserProfile.getEmail()}</ListItem.Subtitle>
          </ListItem.Content>
          {!isEmpty(userData.name) && <ListItem.Chevron/>}
        </ListItem>
      </View>
    );
  };

  const renderLogInOrOutButton = () => {
    return (
      <View>
        <Button
          onPress={() => isEmpty(userData.name) ? dispatch(logout()) : setIsLogoutModalVisible(true)}
          title={isEmpty(userData.name) ? 'Log In' : 'Log out'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        {isEmpty(userData.name) && (
          <Button
            onPress={clearUser}
            title={isEmpty(userData.name) && 'Clear and Return to Log In'}
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
            onPress={clearUser}
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
    <View>
      {renderProfile()}
      {Platform.OS !== 'web' && (
        <>
          {renderLogInOrOutButton()}
          {renderLogoutModal()}
        </>
      )}
    </View>
  );
};

export default UserProfile;
