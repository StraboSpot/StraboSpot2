import React, {Component} from 'react';
import {ScrollView, Text, View} from 'react-native';
import styles from './NotebookPanel.styles';

const NotebookMeasurements = props => (
  <View>
    <View>
      <Text style={props.style}>{props.measurements}</Text>
    </View>
  </View>
);

export default NotebookMeasurements;
