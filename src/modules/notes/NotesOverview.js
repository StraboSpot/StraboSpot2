import React from 'react';
import {Button, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import {notebookReducers, NotebookPages} from '../notebook-panel/notebook.constants';
import noteStyles from './notes.styles';

const SpotNotesOverview = props => {

  const dispatch = useDispatch();
  const savedNote = useSelector(state => state.spot.selectedSpot.properties.notes);

  return (
    <View>
      {savedNote ? <View style={noteStyles.notesOverviewContainer}>
      <View style={{flex: 4}}>
        <Text style={props.style}>{truncateText(savedNote, 50)}</Text>
      </View>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <View style={noteStyles.editButton}>
          <Button
            title={'Edit'}
            onPress={() => dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.NOTE})}
            style={noteStyles.editButton}
          />
        </View>
      </View>
    </View> : <Text style={commonStyles.noValueText}>No Notes</Text>}
    </View>
  );
};

export default SpotNotesOverview;
