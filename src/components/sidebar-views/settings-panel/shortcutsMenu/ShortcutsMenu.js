import React, {Component} from 'react';
import {Text, ScrollView, View} from 'react-native';
import styles from './ShortcutsMenuStyles';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';


const ShortcutMenu = props => (
  <View style={styles.container}>
    <Button
      onPress={props.onPress}
      containerStyle={styles.buttonContainer}
      buttonStyle={styles.backButton}
      titleStyle={styles.textStyle}
      title={'Settings'}
      type={'clear'}
      icon={
        <Icon
          name={'ios-arrow-back'}
          size={20}
          color={'#407ad9'}
      />}
    />
    <Text>Shortcuts Menu</Text>

  </View>
);

export default ShortcutMenu;
