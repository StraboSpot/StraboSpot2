import React from 'react';
import {FlatList, Platform, Switch, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import shortcutMenuStyles from './shortcutsMenu.styles';
import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import {setShortcutSwitchPositions} from '../../home/home.slice';
import {MODAL_KEYS, SHORTCUT_MODALS} from '../../page/page.constants';

const ShortcutMenu = () => {
  const dispatch = useDispatch();
  const shortcutSwitchPositions = useSelector(state => state.home.shortcutSwitchPosition);

  const toggleSwitch = (switchName) => {
    dispatch(setShortcutSwitchPositions({switchName: switchName}));
  };

  const renderShortcutListItem = (toggleButton) => {
    if (Platform.OS !== 'web' || (Platform.OS === 'web'
      && toggleButton.key !== MODAL_KEYS.SHORTCUTS.PHOTO && toggleButton.key !== MODAL_KEYS.SHORTCUTS.SKETCH)) {
      return (
        <ListItem containerStyle={commonStyles.listItem}>
          <Avatar
            source={toggleButton.icon_src}
            placeholderStyle={{backgroundColor: 'transparent'}}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{toggleButton.label}</ListItem.Title>
          </ListItem.Content>
          <Switch
            onValueChange={() => toggleSwitch(toggleButton.key)}
            value={shortcutSwitchPositions[toggleButton.key]}
          />
        </ListItem>
      );
    }
  };

  return (
    <>
      <View style={shortcutMenuStyles.textContainer}>
        <Text style={shortcutMenuStyles.textStyle}>Shortcuts will create a NEW spot</Text>
      </View>
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>All</ListItem.Title>
        </ListItem.Content>
        <Switch
          onValueChange={() => toggleSwitch('all')}
          value={shortcutSwitchPositions.all}
        />
      </ListItem>
      <FlatList
        keyExtractor={item => item.key}
        data={SHORTCUT_MODALS}
        renderItem={({item}) => renderShortcutListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </>
  );
};

export default ShortcutMenu;
