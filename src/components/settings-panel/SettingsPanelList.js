import React from 'react';
import {Text, ScrollView, View} from 'react-native';
import * as SharedUI from '../../shared/ui/index';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {SettingsMenuItems} from './SettingsMenu.constants';
import HomePanelDivider from './HomePanelDivider';
// Styles
import styles from './SettingsPanelStyles';
import * as themes from '../../shared/styles.constants';

const SettingsPanelList = props => {
  return (
    <ScrollView>
      <HomePanelDivider sectionText={'Manage'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.MANAGE).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.MANAGE[key])}>
            {SettingsMenuItems.MANAGE[key]}
          </SharedUI.ButtonNoBackground>,
        )}
      </View>
      <HomePanelDivider sectionText={'Attributes'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.ATTRIBUTES).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.ATTRIBUTES[key])}>
            {SettingsMenuItems.ATTRIBUTES[key]}
          </SharedUI.ButtonNoBackground>,
        )}
      </View>
      <HomePanelDivider sectionText={'Maps'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.MAPS).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.MAPS[key])}>
            {SettingsMenuItems.MAPS[key]}
          </SharedUI.ButtonNoBackground>,
        )}
      </View>
      <HomePanelDivider sectionText={'Preferences'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.APP_PREFERENCES).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.APP_PREFERENCES[key])}>
            {SettingsMenuItems.APP_PREFERENCES[key]}
          </SharedUI.ButtonNoBackground>,
        )}
      </View>
      <HomePanelDivider sectionText={'Help'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.HELP).map(key =>
          <SharedUI.ButtonNoBackground
            key={key}
            style={styles.navItemStyle}
            onPress={() => props.onPress(SettingsMenuItems.HELP[key])}>
            {SettingsMenuItems.HELP[key]}
          </SharedUI.ButtonNoBackground>,
        )}
      </View>
      <HomePanelDivider sectionText={'Manage'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.USER_PREFERENCES).map(key =>
          <View key={key} style={[styles.navItemStyle, {}]}>
            {/*<SharedUI.ButtonNoBackground*/}
            {/*onPress={() => goSignIn()}*/}
            {/*// name={'ios-log-out'}*/}
            {/*// color={'black'}*/}
            {/*// size={25}*/}
            {/*>*/}
            {/*{SettingsMenuItems.USER_PREFERENCES[key]}*/}
            {/*</SharedUI.ButtonNoBackground>*/}
            <Button
              icon={
                <Icon
                  name={'ios-log-out'}
                  size={30}
                  color={themes.PRIMARY_ITEM_TEXT_COLOR}
                />
              }
              iconRight
              raised
              onPress={props.signout}
              title={props.title}
              buttonStyle={{backgroundColor: themes.LIGHTGREY}}
              containerStyle={{marginLeft: 20, marginRight: 20, marginTop: 10}}
              titleStyle={{paddingRight: 20, color: themes.PRIMARY_ITEM_TEXT_COLOR}}
              // type={'solid'}
              // name={'ios-log-out'}
              // onPress={props.signout}
              // backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
              // color={'black'}
            />
            {/*<Text>{SettingsMenuItems.USER_PREFERENCES[key]}</Text>*/}
          </View>,
        )}
      </View>
    </ScrollView>
  );
};

export default SettingsPanelList;
