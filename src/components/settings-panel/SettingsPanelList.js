import React from 'react';
import {ScrollView, View, TouchableOpacity} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {SettingsMenuItems} from './SettingsMenu.constants';
import HomePanelDivider from './HomePanelDivider';
// Styles
import styles from './SettingsPanelStyles';
import * as themes from '../../shared/styles.constants';

const SettingsPanelList = props => {

  const renderButtons = (name, key) => {
    return (
        <Button
          title={name === SettingsMenuItems.MANAGE.ACTIVE_PROJECTS ?
            SettingsMenuItems.MANAGE.ACTIVE_PROJECTS + ` (${props.activeProject})` : name}
          type={'clear'}
          containerStyle={styles.navItemStyle}
          titleStyle={styles.navButtonText}
          onPress={() => props.onPress(name)}
        />
    );
  };

  return (
    <ScrollView>
      <HomePanelDivider sectionText={'Manage'}/>
      <View style={styles.navSectionStyle}>
        {Object.keys(SettingsMenuItems.MANAGE).map(key => renderButtons(SettingsMenuItems.MANAGE[key], key))}
      <HomePanelDivider sectionText={'Attributes'}/>
        {Object.keys(SettingsMenuItems.ATTRIBUTES).map(key => renderButtons(SettingsMenuItems.ATTRIBUTES[key], key))}
      <HomePanelDivider sectionText={'Maps'}/>
        {Object.keys(SettingsMenuItems.MAPS).map(key => renderButtons(SettingsMenuItems.MAPS[key], key))}
      <HomePanelDivider sectionText={'Preferences'}/>
        {Object.keys(SettingsMenuItems.APP_PREFERENCES).map(key => renderButtons(SettingsMenuItems.APP_PREFERENCES[key], key))}
      <HomePanelDivider sectionText={'Help'}/>
        {Object.keys(SettingsMenuItems.HELP).map(key => renderButtons(SettingsMenuItems.HELP[key], key))}
      <HomePanelDivider sectionText={'User Preferences'}/>
        {Object.keys(SettingsMenuItems.USER_PREFERENCES).map(key =>
          <View key={key} style={[styles.navItemStyle, {}]}>
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
              titleStyle={{paddingRight: 20, color: themes.PRIMARY_ITEM_TEXT_COLOR}}/>
          </View>,
        )}
      </View>
    </ScrollView>
  );
};

export default SettingsPanelList;
