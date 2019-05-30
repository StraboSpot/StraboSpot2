import React, {Component} from 'react';
import {ScrollView, Text, View} from 'react-native';

const SpotMeasurementsOverview = props => (
  <View>
    <View>
      <Text style={props.style}>{props.measurements}</Text>
    </View>
  </View>
);

export default SpotMeasurementsOverview;
