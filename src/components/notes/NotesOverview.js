import React, {useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {Input} from 'react-native-elements/src/index'
import noteStyles from './notes.style';
import {connect} from "react-redux";
import {EDIT_SPOT_PROPERTIES, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import  * as actionCreators from '../../store/actions/index';
import imageStyles from "../images/images.styles";
import {SpotPages} from "../notebook-panel/Notebook.constants";

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
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page))
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotNotesOverview);
