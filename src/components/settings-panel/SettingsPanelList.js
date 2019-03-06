import React from 'react'
import {Text, ScrollView, View} from 'react-native'
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import Icon from 'react-native-vector-icons/Ionicons';
import {SettingsMenuItems} from './SettingsMenu.constants';
import {goSignIn} from '../../routes/Navigation';
import styles from './SettingsPanelStyles';

const SettingsPanelList = props => (
  <ScrollView>
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionHeadingTextStyle}>Attributes</Text>
      </View>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.ATTRIBUTES).map(key =>
          <ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.ATTRIBUTES[key])}>
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
          <ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.APP_PREFERENCES[key])}>
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
          <ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.MAPS[key])}>
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
          <ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.HELP[key])}>
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
          <View key={key} style={{marginTop: 10, flexDirection: 'row'}}>
            {/*<ButtonNoBackground*/}
              {/*onPress={() => goSignIn()}*/}
              {/*// name={'ios-log-out'}*/}
              {/*// color={'black'}*/}
              {/*// size={25}*/}
            {/*>*/}
              {/*{SettingsMenuItems.USER_PREFERENCES[key]}*/}
            {/*</ButtonNoBackground>*/}
            <Icon.Button
              name={'ios-log-out'}
              onPress={() => goSignIn()}
              backgroundColor={'lightgrey'}
              color={'black'}
            >
                <Text>{SettingsMenuItems.USER_PREFERENCES[key]}</Text>
            </Icon.Button>

          </View>
        )}
      </View>
    </View>
  </ScrollView>
);

export default SettingsPanelList;
