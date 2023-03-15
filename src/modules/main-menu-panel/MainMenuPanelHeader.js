import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {MAIN_MENU_TITLE} from './mainMenu.constants';
import styles from './mainMenuPanel.styles';

const MainMenuPanelHeader = (props) => {
  const pageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const isSideMenuVisible = useSelector(state => state.mainMenu.isSidePanelVisible);

  return (
    <View style={styles.mainMenuHeaderContainer}>
      {pageVisible && !isSideMenuVisible && (
        <Icon
          name={'ios-arrow-back'}
          type={'ionicon'}
          iconStyle={styles.buttons}
          onPress={() => props.onPress()}
          size={30}
        />
      )}
      <View style={pageVisible && !isSideMenuVisible ? [{paddingRight: 30}, styles.mainMenuHeaderTextContainer]
        : styles.mainMenuHeaderTextContainer}>
        <Text style={styles.headerText}>{pageVisible || MAIN_MENU_TITLE}</Text>
      </View>
    </View>
  );
};

export default MainMenuPanelHeader;
