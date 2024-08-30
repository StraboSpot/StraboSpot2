import React from 'react';
import {FlatList, Platform} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';

const MainMenuPanelList = ({
                             activeProject,
                           }) => {
  const dispatch = useDispatch();

  const renderMenuListItem = (name) => {
    if (name !== MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT && name !== MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS
      || ((name === MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT || name === MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS)
        && Platform.OS !== 'web')) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => setVisibleMenu(name)}
        >
          <ListItem.Content>
            {<ListItem.Title style={commonStyles.listItemTitle}>
              {name === MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS
                ? MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS + ` (${activeProject})`
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
      <>
        <SectionDivider dividerText={toTitleCase(menuItem)}/>
        <FlatList
          keyExtractor={item => item.toString()}
          data={Object.values(submenuItems)}
          renderItem={({item}) => renderMenuListItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </>
    );
  };

  const setVisibleMenu = (name) => {
    dispatch(setMenuSelectionPage({name: name}));
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
