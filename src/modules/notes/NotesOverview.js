import React from 'react';
import {Button, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {truncateText} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import noteStyles from './notes.styles';

const SpotNotesOverview = props => {

  const dispatch = useDispatch();
  const savedNote = useSelector(state => state.spot.selectedSpot.properties.notes);

  return (
    <View>
      {savedNote ? (
        <View style={noteStyles.notesOverviewContainer}>
          <View>
            <Text style={props.style}>{truncateText(savedNote, 750)}</Text>
          </View>
          <View style={{flex: 1, justifyContent: 'flex-start'}}/>
        </View>
      ) : <ListEmptyText text={'No Notes'}/>}
      {savedNote && (
        <View style={noteStyles.editButton}>
          <Button
            title={'Edit'}
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.NOTE))}
            style={noteStyles.editButton}
          />
        </View>
      )}
    </View>
  );
};

export default SpotNotesOverview;
