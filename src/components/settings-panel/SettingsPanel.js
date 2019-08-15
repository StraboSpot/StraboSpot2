import React from 'react';
import {View} from 'react-native';
import styles from "./SettingsPanelStyles";
import SettingsPanelList from './SettingsPanelList';
import UserProfileComponent from './UserProfileComponent';

const SettingsPanel = props => {
  return (
    <View style={{ flex:1}}>
      <View style={styles.container} >
          <UserProfileComponent/>
      </View>
      <View style={styles.listContainer} >
        <SettingsPanelList onPress={(name) => props.onPress(name)}/>
      </View>
    </View>
  );
};

export default SettingsPanel;
