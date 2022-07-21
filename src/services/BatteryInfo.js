import React from 'react';
import {Text, View} from 'react-native';

import {useBatteryLevel, usePowerState} from 'react-native-device-info';
import {Icon} from 'react-native-elements';

import homeStyles from '../modules/home/home.style';
import {roundToDecimalPlaces, toNumberFixedValue} from '../shared/Helpers';
import uiStyles from '../shared/ui/ui.styles';

const BatteryInfo = () => {
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();

  const batteryPercentage = (batteryLevel * 100).toFixed(0);

  const batteryLevelIcon = () => {
    if (powerState.batteryState === 'charging') return 'battery-charging';
    if (batteryLevel > 0.81 && batteryLevel <= 0.90) return 'battery-90';
    if (batteryLevel >= 0.71 && batteryLevel <= 0.80) return 'battery-80';
    if (batteryLevel >= 0.61 && batteryLevel <= 0.70) return 'battery-70';
    if (batteryLevel >= 0.51 && batteryLevel <= 0.60) return 'battery-60';
    if (batteryLevel >= 0.41 && batteryLevel <= 0.50) return 'battery-50';
    if (batteryLevel >= 0.31 && batteryLevel <= 0.40) return 'battery-40';
    if (batteryLevel >= 0.21 && batteryLevel <= 0.30) return 'battery-30';
    if (batteryLevel >= 0.11 && batteryLevel <= 0.20) return 'battery-20';
    if (batteryLevel >= 0.05 && batteryLevel <= 0.10) return 'battery-10';
    if (batteryLevel > 0 && batteryLevel <= 0.05) return 'battery-alert-variant-outline';
    else return 'battery';
  };

  const batteryPercentColor = () => {
    if (batteryLevel > 0.21 && batteryLevel <= 0.30) return uiStyles.batteryLevelYellow;
    if (batteryLevel > 0 && batteryLevel <= 0.20) return uiStyles.batteryLevelRed;
  };

  return (
    <View style={homeStyles.batteryLevelContainer}>
      <Text style={batteryPercentColor()}>{batteryPercentage}%</Text>
      <Icon
        name={batteryLevelIcon()}
        iconStyle={batteryPercentColor()}
        type={'material-community'}
        size={20}
      />
    </View>
  );
};

export default BatteryInfo;
