import React, {useState} from 'react';
import {Text, View} from 'react-native';
import noteStyles from './notes.styles';
import {connect} from 'react-redux';
import {Input} from 'react-native-elements';
import {notebookReducers, NotebookPages} from '../notebook-panel/Notebook.constants';
import {spotReducers} from '../../spots/Spot.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';

const notesView = (props) => {

  const [date, setDate] = useState('');
  const [note, setNote] = useState(props.selectedSpot.properties.notes);

  let timeStamp = Date();

  // const date = new Date.now();
  return (
    <View>
      <ReturnToOverviewButton
        onPress={() => props.setNotebookPageVisible(NotebookPages.OVERVIEW)}
      />
      <View style={noteStyles.container}>
        <View style={[noteStyles.inputContainer]}>
          <Text style={props.style}>{date}</Text>
          <Input
            placeholder='Enter a note...'
            maxLength={300}
            inputContainerStyle={{borderColor: 'transparent'}}
            multiline={true}
            onChangeText={(text) => setNote(text)}
            onFocus={() => setDate(timeStamp)}
            value={note}
            onBlur={() => {
              console.log(note);
              props.onSpotEdit('notes', note);
              // props.setNoteTimestamp(date);
            }}
           />
        </View>
      </View>
    </View>

  );
};

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(notesView);
