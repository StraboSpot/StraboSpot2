import React from 'react';
import {Platform, View} from 'react-native';

import BatteryInfo from '../../services/BatteryInfo';
import ConnectionStatusIcon from '../../services/ConnectionStatusIcon';
import homeStyles from './home.style';

const StatusBar = (props) => {
  return (
    <React.Fragment>
      {Platform.OS !== 'web' && <View style={homeStyles.iconContainer}>
        <View style={homeStyles.statusBarContainer}>
          <View style={{marginStart: '50%'}}>
            <ConnectionStatusIcon/>
          </View>
          <View style={{marginEnd: 10}}>
            {<BatteryInfo/>}
          </View>
        </View>
      </View>}
    </React.Fragment>
  );
};

export default StatusBar;
