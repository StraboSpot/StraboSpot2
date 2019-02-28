import React from 'react'
import {Button, Text, ScrollView, StyleSheet, View} from 'react-native'
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {SettingsMenuItems} from './SettingsMenu.constants';
import {goSignIn} from '../../../routes/Navigation';

const SettingsPanelList = props => (
  <ScrollView>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Attributes</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.ATTRIBUTES).map(key =>
          <ButtonNoBackground key={key} onPress={() => props.onPress(SettingsMenuItems.ATTRIBUTES[key])}>
            {SettingsMenuItems.ATTRIBUTES[key]}
          </ButtonNoBackground>
        )}
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>App Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.APP_PREFERENCES).map(key =>
          <ButtonNoBackground key={key} onPress={() => props.onPress(SettingsMenuItems.APP_PREFERENCES[key])}>
            {SettingsMenuItems.APP_PREFERENCES[key]}
          </ButtonNoBackground>
        )}
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Maps</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.MAPS).map(key =>
          <ButtonNoBackground key={key} onPress={() => props.onPress(SettingsMenuItems.MAPS[key])}>
            {SettingsMenuItems.MAPS[key]}
          </ButtonNoBackground>
        )}
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Help</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.HELP).map(key =>
          <ButtonNoBackground key={key} onPress={() => props.onPress(SettingsMenuItems.HELP[key])}>
            {SettingsMenuItems.HELP[key]}
          </ButtonNoBackground>
        )}
      </View>
    </View>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>User Preferences</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.USER_PREFERENCES).map(key =>
          <ButtonNoBackground
            key={key}
            style={{flexDirection: 'row', marginLeft: 10, marginTop: 10}}
            onPress={() => goSignIn()}
            name={'ios-log-out'}
            size={25}
          >
            {SettingsMenuItems.USER_PREFERENCES[key]}
          </ButtonNoBackground>
        )}
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  navSectionStyle: {
    backgroundColor: 'transparent',
    marginLeft: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flex: 1,
  },
  sectionHeading: {
    alignItems: 'flex-start',
    marginLeft: 10,
    // borderBottomWidth: 3,
    // borderBottomColor: 'black',
    backgroundColor: 'lightgrey',
  },
  sectionHeadingTextStyle: {
    paddingTop: 15,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SettingsPanelList;
