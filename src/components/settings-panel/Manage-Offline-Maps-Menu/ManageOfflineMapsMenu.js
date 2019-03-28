import React from 'react';
import {Image, Text, View} from 'react-native';
import styles from './ManageOfflineStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';

const ManageOfflineMapsMenu = props => (
  <View style={styles.container}>
    <View>
      <ButtonNoBackground
        style={styles.button}
        onPress={props.onPress}
        name={'ios-arrow-back'}
        size={20}
        color={'#407ad9'}
      >
        <Text style={styles.textStyle}>Settings</Text>
      </ButtonNoBackground>
    </View>
    <View style={{alignItems: 'center'}}>
      <Text style={styles.headingText}>Manage Offline BaseMaps</Text>
    </View>

  </View>
);

export default ManageOfflineMapsMenu;
