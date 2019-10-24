import React from 'react'
import {Text, ScrollView, View} from 'react-native'
import * as SharedUI from '../../shared/ui/index'
import Icon from 'react-native-vector-icons/Ionicons';
import {SettingsMenuItems} from './SettingsMenu.constants';

// Styles
import styles from './SettingsPanelStyles';
import * as themes from '../../shared/styles.constants';

const SettingsPanelList = props => {
  return (
    <ScrollView>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Attributes</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.ATTRIBUTES).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.ATTRIBUTES[key])}>
            {SettingsMenuItems.ATTRIBUTES[key]}
          </SharedUI.ButtonNoBackground>
        )}
      </View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>App Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.APP_PREFERENCES).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.APP_PREFERENCES[key])}>
            {SettingsMenuItems.APP_PREFERENCES[key]}
          </SharedUI.ButtonNoBackground>
        )}
      </View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Maps</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.MAPS).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.MAPS[key])}>
            {SettingsMenuItems.MAPS[key]}
          </SharedUI.ButtonNoBackground>
        )}
      </View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Help</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.HELP).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.HELP[key])}>
            {SettingsMenuItems.HELP[key]}
          </SharedUI.ButtonNoBackground>
        )}
      </View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>User Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.USER_PREFERENCES).map(key =>
          <View key={key} style={{marginTop: 10, flexDirection: 'row'}}>
            {/*<SharedUI.ButtonNoBackground*/}
            {/*onPress={() => goSignIn()}*/}
            {/*// name={'ios-log-out'}*/}
            {/*// color={'black'}*/}
            {/*// size={25}*/}
            {/*>*/}
            {/*{SettingsMenuItems.USER_PREFERENCES[key]}*/}
            {/*</SharedUI.ButtonNoBackground>*/}
            <Icon.Button
              name={'ios-log-out'}
              onPress={props.signout}
              backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
              color={'black'}
            >
              <Text>{SettingsMenuItems.USER_PREFERENCES[key]}</Text>
            </Icon.Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SettingsPanelList;
