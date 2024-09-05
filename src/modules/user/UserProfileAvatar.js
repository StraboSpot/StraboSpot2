import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';

import {Avatar} from 'react-native-elements';
import {useSelector} from 'react-redux';

import userStyles from './user.styles';
import useUserProfileHook from './useUserProfile';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import {isEmpty} from '../../shared/Helpers';

const UserProfileAvatar = ({isEditable, openProfileImageModal, shouldUpdateImage, size, tempUserProfileImageURI}) => {
  const isOnline = useSelector(state => state.connections.isOnline);
  const imageURI = useSelector(state => state.user?.image);

  const useUserProfile = useUserProfileHook();
  const useDevice = useDeviceHook();

  const [source, setSource] = useState(undefined);

  useEffect(() => {
    getAvatarSource();
  }, [tempUserProfileImageURI, shouldUpdateImage]);

  const getAvatarSource = async () => {
    console.log('tempUserProfileImageURI', tempUserProfileImageURI);
    if (Platform.OS === 'web') {
      if (!isEmpty(imageURI)) setSource({uri: imageURI});
      else setSource(undefined);
    }
    else if (!isEditable && !isEmpty(tempUserProfileImageURI)) setSource({uri: tempUserProfileImageURI});
    else {
      const doesProfileImageExist = await useDevice.doesFileExist(APP_DIRECTORIES.PROFILE_IMAGE);
      console.log('doesProfileImageExist', doesProfileImageExist);
      if (doesProfileImageExist) setSource({uri: 'file://' + APP_DIRECTORIES.PROFILE_IMAGE + '?' + new Date()}); // Avoid caching with date
      else if (!isEmpty(imageURI) && typeof imageURI.valueOf() === 'string') setSource({uri: imageURI});
      else setSource(undefined);
    }
  };

  return (
    <Avatar
      containerStyle={{backgroundColor: 'darkgrey'}}
      rounded
      size={size}
      source={source}
      title={useUserProfile.getInitials()}
      titleStyle={userStyles.avatarPlaceholderTitleStyle}
    >
      {isEditable && isOnline.isInternetReachable && Platform.OS !== 'web' && (
        <View style={{position: 'relative', right: 15, bottom: 15}}>
          <Avatar.Accessory
            color={'grey'}
            iconStyle={{color: 'white'}}
            name={'pencil'}
            onPress={openProfileImageModal}
            reverse
            size={23}
            type={'font-awesome'}
          />
        </View>
      )}
    </Avatar>
  );
};

export default UserProfileAvatar;
