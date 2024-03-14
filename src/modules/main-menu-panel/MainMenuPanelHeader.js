import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {MAIN_MENU_TITLE} from './mainMenu.constants';
import styles from './mainMenuPanel.styles';

const MainMenuPanelHeader = ({onPress}) => {
  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const isSideMenuVisible = useSelector(state => state.mainMenu.isSidePanelVisible);

  return (
    <View style={styles.mainMenuHeaderContainer}>
      <View style={styles.mainMenuIconContainer}>
        {settingsPageVisible && !isSideMenuVisible && (
          <Icon
            name={'arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={styles.buttons}
            onPress={onPress}
            size={30}
          />
        )}
      </View>
      <View style={styles.mainMenuHeaderTextContainer}>
        <Text style={styles.headerText}>{settingsPageVisible || MAIN_MENU_TITLE}</Text>
      </View>
      <View style={{flex: 1, paddingBottom: 10}}/>
    </View>
  );
};

export default MainMenuPanelHeader;
