import React from 'react';
import {View} from 'react-native';
import styles from "./SettingsPanelStyles";
import SettingsPanelList from './SettingsPanelList';
import UserProfileComponent from './UserProfileComponent';

const SettingsPanel = props => {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <UserProfileComponent/>
      </View>
      <SettingsPanelList onPress={(name) => props.onPress(name)}/>
    </View>
  );
};

export default SettingsPanel;
