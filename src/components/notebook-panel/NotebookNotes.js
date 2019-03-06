import React, {Component} from 'react';
import {Text, View} from 'react-native';
import styles from './NotebookPanel.styles';

const NotebookNotes = props => (
  <View>
    <View>
      <Text style={props.style}>{props.notes}</Text>
    </View>
  </View>
);

export default NotebookNotes;
