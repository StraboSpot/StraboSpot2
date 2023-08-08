import React from 'react';
import {Image, View} from 'react-native';

import {useSelector} from 'react-redux';

import uiStyles from '../shared/ui/ui.styles';

const ConnectionStatusIcon = () => {
  const onlineIcon = require('../assets/icons/ConnectionStatusButton_online.png');
  const offlineIcon = require('../assets/icons/ConnectionStatusButton_offline.png');
  const accessPointIcon = require('../assets/icons/ConnectionStatusButton_connected.png');

  const isOnline = useSelector(state => state.home.isOnline);

  const getNetworkStatusIcon = () => {
    if (isOnline.isConnected && isOnline.isInternetReachable) return onlineIcon;
    else if (!isOnline.isConnected && !isOnline.isInternetReachable) return offlineIcon;
    else return accessPointIcon;
  };

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image
        source={getNetworkStatusIcon()}
        style={uiStyles.offlineIcon}
      />
      {/*<Text>Is Online: {isOnline?.isInternetReachable?.toString()} </Text>*/}
      {/*<Text>Is Connected: {isOnline?.isConnected?.toString()}</Text>*/}
    </View>
  );
};

export default ConnectionStatusIcon;
