import React, {useEffect} from 'react';
import {Text, View} from 'react-native';

import {useBatteryLevel, usePowerState} from 'react-native-device-info';
import {Icon} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {addedStatusMessage, clearedStatusMessages, setWarningModalVisible} from '../modules/home/home.slice';
import homeStyles from '../modules/home/home.style';
import {roundToDecimalPlaces, toNumberFixedValue} from '../shared/Helpers';

const BatteryInfo = () => {
  const batteryLevel = roundToDecimalPlaces(useBatteryLevel(), 2);
  const powerState = usePowerState();

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('UE BatteryInfo [batteryLevel]', batteryLevel);
    lowBatteryLevel();
  }, [batteryLevel]);

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
    if (batteryLevel > 0 && batteryLevel <= 0.30) return {color: 'red', fontWeight: 'bold'};
  };

  const batteryWarning = () => {
    dispatch(clearedStatusMessages());
    dispatch(
      addedStatusMessage(
        `Battery level is at ${batteryLevel * 100}%!  Please find another source of power soon!`,
      ));
    dispatch(setWarningModalVisible(true));
  };

  const lowBatteryLevel = () => {
    switch (batteryLevel) {
      case 0.05:
      case 0.20:
      case 0.30:
        batteryWarning();
    }
  };

  return (
    <View style={homeStyles.batteryLevelContainer}>
      <Text style={batteryPercentColor()}>{toNumberFixedValue(batteryLevel, 0)}</Text>
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
