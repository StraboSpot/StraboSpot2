import React from 'react';
import {Platform, View} from 'react-native';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import homeStyles from './home.style';

const StatusBar = () => {
  if (Platform.OS !== 'web') {
    return (
      <React.Fragment>
        <View style={homeStyles.statusBarContainer}>
          <View>
            <ConnectionStatusIcon/>
          </View>
          <View>
            {<BatteryInfo/>}
          </View>
        </View>
      </React.Fragment>
    );
  }
};

export default StatusBar;
