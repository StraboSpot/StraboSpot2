import React from 'react';
import {Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';

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
        title={toggleButton.NAME}
        leftAvatar={{source: toggleButton.ICON}}
        switch={{
          onChange: () => props.toggleSwitch(toggleButton.NAME),
          value: props.shortcutSwitchPosition[toggleButton.NAME],
        }}
        bottomDivider={i < Object.values(SHORTCUT_TOGGLE_BUTTONS).length - 1}
      />
    ))}
  </React.Fragment>
);

export default ShortcutMenu;
