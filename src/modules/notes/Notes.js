import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import uiStyles from '../../shared/ui/ui.styles';
import {formStyles} from '../form';
import {MODALS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';
import noteStyles from './notes.styles';

const Notes = () => {
  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const [note, setNote] = useState(selectedSpot?.properties?.notes || null);

  const saveNote = async () => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    dispatch(editedSpotProperties({field: 'notes', value: note}));
    dispatch(setSelectedSpotNotesTimestamp());
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
  };

  return (
    <View style={{flex: 1}}>
      {modalVisible === MODALS.SHORTCUT_MODALS.NOTES
        ? (
          <View style={uiStyles.alignItemsToCenter}>
            <Text>Saving a note will create</Text>
            <Text>a new spot.</Text>
          </View>
        )
        : (
          <React.Fragment>
            <ReturnToOverviewButton
              onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
            />
            <SaveAndCloseButton
              cancel={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
              save={() => saveNote()}
            />
          </React.Fragment>
        )
      }
      <View style={noteStyles.container}>
        <TextInput
          placeholder='Enter a note...'
          multiline={true}
          autoFocus={true}
          onChangeText={(text) => setNote(text)}
          value={note}
          style={formStyles.fieldValue}
        />
      </View>
    </View>
  );
};

export default Notes;
