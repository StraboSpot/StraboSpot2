import React, {Component} from 'react';
import {Text, View} from 'react-native';

const SpotNotesOverview = props => (
  <View>
    <View style={{height: 100, backgroundColor: 'white'}}>
      <Text style={props.style}>{props.notes}</Text>
    </View>
  </View>
);

export default SpotNotesOverview;
