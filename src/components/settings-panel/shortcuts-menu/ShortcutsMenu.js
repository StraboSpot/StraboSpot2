import React from 'react';
import {Image, Text, View} from 'react-native';
import styles from './ShortcutsMenuStyles';
import {ListItem} from 'react-native-elements';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';

const ShortcutMenu = props => (
    <React.Fragment>
      {Object.keys(Buttons).map((key, i) => (
        <ListItem
          containerStyle={{backgroundColor: 'transparent', padding: 0}}
          key={i}
          title={
            <View style={styles.itemContainer}>
              <Image style={styles.icons} source={Buttons[key].ICON}/>
              <Text style={styles.itemTextStyle}>{Buttons[key].NAME}</Text>
              <View style={styles.switch}>
              <Switch
                style={{justifyContent: 'flex-end'}}
                value={props.shortcutSwitchPosition[Buttons[key].NAME]}
                onValueChange={(val) => props.toggleSwitch(Buttons[key].NAME)}
                circleSize={25}
                barHeight={20}
                circleBorderWidth={3}
                backgroundActive={'#407ad9'}
                backgroundInactive={'gray'}
                circleActiveColor={'#000000'}
                circleInActiveColor={'#000000'}
                changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
              />
              </View>
            </View>}
        />
      ))}
    </React.Fragment>
);

export default ShortcutMenu;
