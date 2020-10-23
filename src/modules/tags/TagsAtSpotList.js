import React from 'react';
import {FlatList, Text} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, SECONDARY_ITEM_TEXT_COLOR} from '../../shared/styles.constants';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {setSelectedTag} from '../project/projects.slice';
import {useTagsHook} from '../tags';

const TagsAtSpotList = (props) => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);

  const openTag = (tag) => {
    dispatch(setSidePanelVisible({bool: true, view: mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL}));
    dispatch(setSelectedTag(tag));
    dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.ATTRIBUTES.TAGS}));
    if (!isMainMenuPanelVisible) props.openMainMenu();
  };

  const renderTag = (tag) => {
    return (
      <ListItem containerStyle={commonStyles.listItem} key={tag.id} onPress={() => openTag(tag)}>
        <ListItem.Content>
          <ListItem.Title>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={SECONDARY_ITEM_TEXT_COLOR}>{useTags.getLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        <Icon name={'information-circle-outline'} type={'ionicon'} color={PRIMARY_ACCENT_COLOR}/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {!isEmpty(useTags.getTagsAtSpot())
        ? (
          <FlatList
            keyExtractor={item => item.id.toString()}
            data={useTags.getTagsAtSpotGeologicUnitFirst()}
            renderItem={({item}) => renderTag(item)}/>
        )
        : <Text style={commonStyles.noValueText}>No Tags</Text>
      }
    </React.Fragment>
  );
};

export default TagsAtSpotList;
