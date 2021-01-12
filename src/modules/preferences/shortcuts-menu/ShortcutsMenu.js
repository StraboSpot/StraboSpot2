import React from 'react';
import {Switch, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import {SHORTCUT_TOGGLE_BUTTONS} from './shortcuts.constants';
import shortcutMenuStyles from './shortcutsMenu.styles';

const ShortcutMenu = props => (
  <React.Fragment>
    <View style={shortcutMenuStyles.textContainer}>
      <Text style={shortcutMenuStyles.textStyle}>Shortcuts will create a NEW spot</Text>
    </View>
    {Object.values(SHORTCUT_TOGGLE_BUTTONS).map((toggleButton, i) => (
      <ListItem
        key={i}
        bottomDivider={i < Object.values(SHORTCUT_TOGGLE_BUTTONS).length - 1}
      >
        <Avatar source={toggleButton.ICON}
                placeholderStyle={{backgroundColor: 'transparent'}}
        />
        <ListItem.Content>
          <ListItem.Title>{toggleButton.NAME}</ListItem.Title>
        </ListItem.Content>
        <Switch
          onChange={() => props.toggleSwitch(toggleButton.NAME)}
          value={props.shortcutSwitchPosition[toggleButton.NAME]}
        />
      </ListItem>
    ))}
  </React.Fragment>
);

export default ShortcutMenu;
