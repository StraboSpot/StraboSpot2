import React from 'react';
import {Button, Text, View} from 'react-native';
import noteStyles from './notes.styles';
import {connect} from 'react-redux';
import {notebookReducers, NotebookPages} from '../notebook-panel/notebook.constants';

const SpotNotesOverview = props => {

  const savedNote = props.selectedSpot.properties.notes;

  return (
    <View style={noteStyles.notesOverviewContainer}>
      <View style={{flex: 4}}>
        {savedNote !== '' ? <Text style={props.style}>{savedNote}</Text> :
          <Text style={props.style}>There are no notes for this spot</Text>}
      </View>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <View style={noteStyles.editButton}>
          <Button
            title={'Edit'}
            onPress={() => props.setNotebookPageVisible(NotebookPages.NOTE)}
            style={noteStyles.editButton}
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
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotNotesOverview);
