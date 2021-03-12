import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

const useUserProfile = (props) => {
  const userData = useSelector(state => state.user);

  const getUserInitials = () => {
    return userData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  return {
    getUserInitials: getUserInitials,
  }
};

export default useUserProfile;
