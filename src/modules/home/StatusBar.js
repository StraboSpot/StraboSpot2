import React from 'react';
import {Platform, View} from 'react-native';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import homeStyles from './home.style';

const StatusBar = () => {
  if (Platform.OS !== 'web') {
    return (
        <View style={homeStyles.statusBarContainer}>
          <View style={homeStyles.connectionStatusIconContainer}>
            <ConnectionStatusIcon/>
          </View>
          <View>
            {<BatteryInfo/>}
          </View>
        </View>
    );
  }
};

export default StatusBar;