import React from 'react';
import {FlatList} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';

const MainMenuPanelList = (props) => {
  const testingMode = useSelector(state => state.project.isTestingMode);

  const renderMenuListItem = (name) => {
    if (name !== MAIN_MENU_ITEMS.MAPS.STRAT_SECTIONS
      || (name === MAIN_MENU_ITEMS.MAPS.STRAT_SECTIONS && testingMode)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => props.onPress(name)}
        >
          <ListItem.Content>
            {<ListItem.Title style={commonStyles.listItemTitle}>
              {name === MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS
                ? MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS + ` (${props.activeProject})`
                : name
              }
            </ListItem.Title>}
          </ListItem.Content>
        </ListItem>
      );
    }
  };

  const renderMenuSection = ([menuItem, submenuItems]) => {
    return (
      <React.Fragment>
        <SectionDivider dividerText={toTitleCase(menuItem)}/>
        <FlatList
          keyExtractor={item => item.toString()}
          data={Object.values(submenuItems)}
          renderItem={({item}) => renderMenuListItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </React.Fragment>
    );
  };

  return (
    <FlatList
      keyExtractor={item => item.toString()}
      data={Object.entries(MAIN_MENU_ITEMS)}
      renderItem={({item}) => renderMenuSection(item)}
    />
  );
};

export default MainMenuPanelList;
