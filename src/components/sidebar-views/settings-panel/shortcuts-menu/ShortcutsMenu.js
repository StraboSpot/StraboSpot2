import React from 'react';
import {Image, Text, Switch, View} from 'react-native';
import styles from './ShortcutsMenuStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../../ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';

const ShortcutMenu = props => (
  <View style={styles.container}>
    <View>
      <ButtonNoBackground
        style={styles.button}
        onPress={props.onPress}
        name={'ios-arrow-back'}
        size={20}
        color={'#407ad9'}
      >
        <Text style={styles.textStyle}>Settings</Text>
      </ButtonNoBackground>
    </View>
    <View style={{alignItems: 'center'}}>
      <Text style={styles.headingText}>Shortcuts</Text>
    </View>
    <View>
      {Object.keys(Buttons).map((key, i) => (
        <ListItem
          containerStyle={{backgroundColor: 'transparent', padding: 0}}
          key={i}
          title={
            <View style={styles.itemContainer}>
              <Image style={styles.icons} source={Buttons[key].ICON}/>
              <Text style={styles.itemTextStyle}>{Buttons[key].NAME}</Text>
              <View style={styles.switch}>
              <Switch style={{justifyContent: 'flex-end'}} />
              </View>
            </View>}
        />
      ))}
    </View>
  </View>
);

export default ShortcutMenu;
