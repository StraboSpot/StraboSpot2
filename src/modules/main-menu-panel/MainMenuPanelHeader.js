import React from 'react';
import {View, Text} from 'react-native';

import {Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {MAIN_MENU_TITLE} from './mainMenu.constants';
import styles from './mainMenuPanel.styles';

const MainMenuPanelHeader = (props) => {
  const pageVisible = useSelector(state => state.settingsPanel.settingsPageVisible);
  const isSideMenuVisible = useSelector(state => state.settingsPanel.isSidePanelVisible);

  return (
    <View style={styles.settingsPanelHeaderContainer}>
      <View style={styles.settingsPanelIconContainer}>
        {pageVisible && !isSideMenuVisible && <Icon
          name={'ios-arrow-back'}
          type={'ionicon'}
          color={'black'}
          iconStyle={styles.buttons}
          onPress={() => props.onPress()}
          size={30}
        />}
      </View>
      <View style={styles.settingsPanelHeaderTextContainer}>
        <Text style={styles.headerText}>{pageVisible || MAIN_MENU_TITLE}</Text>
      </View>
      <View style={{flex: 1, paddingBottom: 10}}/>
    </View>
  );
};

export default MainMenuPanelHeader;
