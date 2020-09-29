import React from 'react';
import {ScrollView, View} from 'react-native';

import {Button} from 'react-native-elements';

import SectionDivider from '../../shared/ui/SectionDivider';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import styles from './mainMenuPanel.styles';

const MainMenuPanelList = props => {

  const renderButtons = (name, i) => {
    return (
      <View key={i}>
        <Button
          title={name === MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS
            ? MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS + ` (${props.activeProject})`
            : name
          }
          type={'clear'}
          containerStyle={styles.navItemStyle}
          titleStyle={styles.navButtonText}
          onPress={() => props.onPress(name)}
        />
      </View>
    );
  };

  return (
    <ScrollView>
      <View style={styles.navSectionStyle}>
        {Object.entries(MAIN_MENU_ITEMS).map(([item, submenuItems]) => (
          <View key={item}>
            <SectionDivider dividerText={item}/>
            {Object.values(submenuItems).map((submenuItem, index) => renderButtons(submenuItem, index))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MainMenuPanelList;
