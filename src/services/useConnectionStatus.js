import React from 'react';

import {Image} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import uiStyles from '../shared/ui/ui.styles';

const useConnectionStatus = () => {
  const onlineIcon = require('../assets/icons/ConnectionStatusButton_connected.png');
  const offlineIcon = require('../assets/icons/ConnectionStatusButton_offline.png');
  const accessPointIcon = require('../assets/icons/wireless-access-point-icon-11.png');

  const isOnline = useSelector(state => state.home.isOnline);

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
  };
};

export default useConnectionStatus;
