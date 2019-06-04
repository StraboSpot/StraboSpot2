import React, {useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {Input} from 'react-native-elements/src/index'
import noteStyles from './notes.styles';
import {connect} from "react-redux";
import {EDIT_SPOT_PROPERTIES} from "../../../store/Constants";


const notes = [
  {id: 1, Type: 'text', note: ''}
];

const SpotNotesOverview = props => {

  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  let timeStamp = Date();

  const savedNote = props.selectedSpot.properties.notes;

  // const date = new Date.now();
  return (
    <View >
      <Text style={props.style}>{props.notes}{date}</Text>
      {savedNote !== '' ? <Text style={ props.style}>- {savedNote}</Text> : null}
      <Input
        placeholder='Enter a note...'
        maxLength={120}
        multiline={true}
        numberOfLines={10}
        onChangeText={(text) => setNote(text)}
        onFocus={() => setDate(timeStamp)}
        value={note}
        onBlur={() => {
          console.log(note)
          props.onSpotEdit('notes', note)
        }}
      >
      </Input>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.home.selectedSpot
  }
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotNotesOverview);
