import React, {Component} from 'react';
import {Text, View} from 'react-native';

const SpotNotesOverview = props => (
  <View>
    <View>
      <Text style={props.style}>{props.notes}</Text>
    </View>
  </View>
);

export default SpotNotesOverview;
