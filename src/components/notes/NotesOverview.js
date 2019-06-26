import React from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import noteStyles from './notes.style';
import {connect} from "react-redux";
import {notebookReducers, SpotPages} from "../notebook-panel/Notebook.constants";

const SpotNotesOverview = props => {

  const savedNote = props.selectedSpot.properties.notes;

  return (
    <View style={noteStyles.notesOverviewContainer}>
      <View style={{flex: 4}} >
        {savedNote !== '' ? <Text style={ props.style}>{savedNote}</Text> : <Text style={ props.style}>There are no notes for this spot</Text>}
      </View>
      <View style={{flex: 1, justifyContent: 'flex-start'}} >
        <View style={noteStyles.editButton}>
          <Button
            title={'Edit'}
            onPress={() => props.setPageVisible(SpotPages.NOTE)}
            style={noteStyles.editButton}
          />
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.spot.selectedSpot
  }
};

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: notebookReducers.SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotNotesOverview);
