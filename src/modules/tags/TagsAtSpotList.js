import React from 'react';
import {FlatList, Text} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {homeReducers} from '../home/home.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {useTagsHook} from '../tags';

const SpotTag = () => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();

  const openTag = (tag) => {
    dispatch({
      type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
      bool: true,
      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL,
    });
    dispatch({type: projectReducers.SET_SELECTED_TAG, tag: tag});
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.ATTRIBUTES.TAGS});
    dispatch({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: true});
  };

  const renderTag = (tag) => {
    return (
      <ListItem
        chevron={{
          name: 'right',
          type: 'antdesign',
          color: themes.PRIMARY_BACKGROUND_COLOR,
          size: 16,
        }}
        containerStyle={commonStyles.listItem}
        contentContainerStyle={{maxWidth: 150}}
        key={tag.id}
        onPress={() => openTag(tag)}
        pad={5}
        rightContentContainerStyle={{alignItems: 'flex-start'}}
        rightTitle={useTags.getLabel(tag.type)}
        rightTitleStyle={{color: themes.SECONDARY_ITEM_TEXT_COLOR}}
        rightIcon={{
          name: 'ios-information-circle-outline',
          type: 'ionicon',
          color: themes.PRIMARY_ACCENT_COLOR,
        }}
        title={tag.name}
      />
    );
  };

  return (
    <React.Fragment>
      {!isEmpty(useTags.getTagsAtSpot()) ?
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={useTags.getTagsAtSpotGeologicUnitFirst()}
          renderItem={({item}) => renderTag(item)}/>
        : <Text style={commonStyles.noValueText}>No Tags</Text>
      }
    </React.Fragment>
  );
};

export default SpotTag;
