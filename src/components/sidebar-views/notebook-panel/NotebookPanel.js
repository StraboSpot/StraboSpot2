import React, {Component} from 'react'
import {Button, Text, View} from 'react-native'
import styles from "./Styles";


const NotebookPanel = props => (
      <View
        style={styles.subcontainer}
      >
      <Text style={styles.textStyle} visible= {props.visible}
      > Hello there </Text>
        <Button
          title={'Close'}
          onPress={props.close}
        />
      </View>
);

export default NotebookPanel;


