import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {useTagsHook} from '.';
import commonStyles from '../../shared/common.styles';
import {MAIN_MENU_ITEMS, SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {setSelectedTag} from '../project/projects.slice';

const TagsListItem = ({
                        openMainMenuPanel,
                        tag,
                      }) => {
  const useTags = useTagsHook();
  const dispatch = useDispatch();
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);

  const openTag = () => {
    dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_DETAIL}));
    dispatch(setSelectedTag(tag));
    if (tag.type === 'geologic_unit') dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.ATTRIBUTES.GEOLOGIC_UNITS}));
    else dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.ATTRIBUTES.TAGS}));
    if (!isMainMenuPanelVisible) openMainMenuPanel();
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={tag.id}
      onPress={openTag}
      pad={5}
    >
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{tag.name}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{useTags.getTagLabel(tag.type)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};
export default TagsListItem;
