import React from 'react';
import {ScrollView, View} from 'react-native';

import {Button} from 'react-native-elements';

import SectionDivider from '../../shared/ui/SectionDivider';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import styles from './mainMenuPanel.styles';

const MainMenuPanelList = props => {

  const renderButtons = (name, key) => {
    return (
      <Button
        key={key}
        title={name === MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS
          ? MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS + ` (${props.activeProject})`
          : name
        }
        type={'clear'}
        containerStyle={styles.navItemStyle}
        titleStyle={styles.navButtonText}
        onPress={() => props.onPress(name)}
      />
    );
  };

  return (
    <ScrollView>
      <View style={styles.navSectionStyle}>
        {Object.entries(MAIN_MENU_ITEMS).map(([item, submenuItems]) => (
          <View>
            <SectionDivider dividerText={item}/>
            {Object.values(submenuItems).map(submenuItem => renderButtons(submenuItem))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MainMenuPanelList;
