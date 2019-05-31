import React, {Component} from 'react';
import {Text, View} from 'react-native';

const NotesOverview = props => (
    <View style={{height: 100, backgroundColor: 'white'}}>
      <Text style={props.style}>{props.notes}</Text>
    </View>
);

export default NotesOverview;
