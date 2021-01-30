import React from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import {SHORTCUT_TOGGLE_BUTTONS} from './shortcuts.constants';
import shortcutMenuStyles from './shortcutsMenu.styles';

const ShortcutMenu = (props) => {

  const renderShortcutListItem = (toggleButton) => {
    return (
      <ListItem containerStyle={commonStyles.listItem}>
        <Avatar
          source={toggleButton.ICON}
          placeholderStyle={{backgroundColor: 'transparent'}}
        />
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{toggleButton.NAME}</ListItem.Title>
        </ListItem.Content>
        <Switch
          onChange={() => props.toggleSwitch(toggleButton.NAME)}
          value={props.shortcutSwitchPosition[toggleButton.NAME]}
        />
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <View style={shortcutMenuStyles.textContainer}>
        <Text style={shortcutMenuStyles.textStyle}>Shortcuts will create a NEW spot</Text>
      </View>
      <FlatList
        keyExtractor={(item) => item.toString()}
        data={Object.values(SHORTCUT_TOGGLE_BUTTONS)}
        renderItem={({item}) => renderShortcutListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </React.Fragment>
  );
};

export default ShortcutMenu;
