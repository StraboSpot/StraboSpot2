import React from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import shortcutMenuStyles from './shortcutsMenu.styles';
import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import {SHORTCUT_MODALS} from '../../page/page.constants';

const ShortcutMenu = (props) => {

  const renderShortcutListItem = (toggleButton) => {
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
          onValueChange={() => props.toggleSwitch(toggleButton.key)}
          value={props.shortcutSwitchPosition[toggleButton.key]}
        />
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <View style={shortcutMenuStyles.textContainer}>
        <Text style={shortcutMenuStyles.textStyle}>Shortcuts will create a NEW spot</Text>
      </View>
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>All</ListItem.Title>
        </ListItem.Content>
        <Switch
          onValueChange={() => props.toggleSwitch('all')}
          value={props.shortcutSwitchPosition.all}
        />
      </ListItem>
      <FlatList
        keyExtractor={item => item.key}
        data={SHORTCUT_MODALS}
        renderItem={({item}) => renderShortcutListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </React.Fragment>
  );
};

export default ShortcutMenu;
