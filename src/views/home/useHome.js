import React from 'react';
import {Alert, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {homeReducers} from './Home.constants';
import NetInfo from '@react-native-community/netinfo';


const useHome = (props) => {
  const dispatch = useDispatch();

  const getOnlineStatus = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
      else if (state.isConnected) Alert.alert(state.isConnected.toString());
    });
  };

  // //function for online/offline state change event handler
  // const handleConnectivityChange = isConnected => {
  //   dispatch({type: homeReducers.SET_ISONLINE, online: isConnected});
  // };

  const toggleLoading = bool => {
    dispatch({type: homeReducers.SET_LOADING, bool: bool})
    // console.log('Loading', props.loading);
  };




  return [{
    getOnlineStatus: getOnlineStatus,
    toggleLoading: toggleLoading,
  }];
};

export default useHome;
