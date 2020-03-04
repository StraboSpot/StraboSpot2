import React from 'react';
import {ScrollView, View} from 'react-native';
import {Button} from 'react-native-elements';

import HomePanelDivider from './MainMenuPanelDivider';
import {SettingsMenuItems} from './mainMenu.constants';

// Styles
import styles from './mainMenuPanel.styles';

const MainMenuPanelList = props => {

  const renderButtons = (name, key) => {
    return (
      <Button
        key={key}
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
      </View>
    </ScrollView>
  );
};

export default MainMenuPanelList;
