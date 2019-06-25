import React, {Component} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from "react-redux";

const MeasurementsOverview = props => (
  <View style={{height: 100, backgroundColor: 'white'}}>
    <Text style={props.style}>{props.orientations}</Text>
  </View>
);

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

export default connect(mapStateToProps)(MeasurementsOverview);

