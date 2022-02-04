import React from 'react';

import {useNetInfo} from '@react-native-community/netinfo';
import {Image} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import uiStyles from '../shared/ui/ui.styles';

const useConnectionStatus = () => {
  const netInfo = useNetInfo();

  const onlineIcon = require('../assets/icons/ConnectionStatusButton_connected.png');
  const offlineIcon = require('../assets/icons/ConnectionStatusButton_offline.png');
  const accessPointIcon = require('../assets/icons/wireless-access-point-icon-11.png');

  const isOnline = useSelector(state => state.home.isOnline);

  const getNetInfo = () => {
    return netInfo;
  };

  const connectionStatusIcon = () => {
    if (!isOnline.isConnected && !isOnline.isInternetReachable) {
      return (
        <Image
          source={offlineIcon}
          style={uiStyles.offlineIcon}
        />
      );
    }
    else if (isOnline.isConnected && !isOnline.isInternetReachable) {
      return (
        <Image
          source={accessPointIcon}
          style={uiStyles.accessPointIcon}
        />
      );
    }
    else {
      return (
        <Image
          source={onlineIcon}
          style={uiStyles.offlineIcon}
        />
      );
    }
  };

  return {
    connectionStatusIcon: connectionStatusIcon,
    getNetInfo: getNetInfo,
  };
};

export default useConnectionStatus;
