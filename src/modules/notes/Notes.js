import React, {useState, useEffect} from 'react';
import {Text, TextInput, View} from 'react-native';

import {Button} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';
import noteStyles from './notes.styles';

const Notes = (props) => {
  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spots);

  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      console.log('In Notes Modal view');
    }
    else if (selectedSpot.properties.notes) {
      console.log('selectedSpot.properties', selectedSpot.properties);
      setNote(selectedSpot.properties.notes);
    }
  }, []);

  // useEffect(() => {
  //   if (isEmpty(selectedSpot.properties.notes)) {
  //     setNote(selectedSpot.properties.notes);
  //   }
  // },[selectedSpot]);

  let timeStamp = Date();

  const saveNote = async () => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.NOTES) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    console.log(note);
    dispatch(editedSpotProperties({field: 'notes', value: note}));
    dispatch(setSelectedSpotNotesTimestamp());
    setNote('');
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
  };

  // const setPointToCurrentLocation = async () => {
  //   const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
  //   console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
  //   selectedSpot.properties.notes = new Date().toDateString() + '- ';
  // };

  const renderNotebookView = () => {
    return (
      <View>
        {modalVisible === MODALS.SHORTCUT_MODALS.NOTES
          ? (
            <View style={uiStyles.alignItemsToCenter}>
              <Text>Saving a note will create</Text>
              <Text>a new spot.</Text>
            </View>
          )
          : (
            <ReturnToOverviewButton
              onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
            />
          )
        }
        <View style={noteStyles.container}>
          {/*{!isEmpty(selectedSpot) ? <Text>{selectedSpot.properties.notes}</Text> : <Text>'No Note'</Text>}*/}
          <View style={[noteStyles.inputContainer]}>
            {/*<Text style={props.style}>{date}</Text>*/}
            <TextInput
              placeholder='Enter a note...'
              maxLength={300}
              inputContainerStyle={{borderColor: 'transparent'}}
              multiline={true}
              onChangeText={(text) => setNote(text)}
              // onFocus={() => setDate(timeStamp)}
              value={note}
              // onBlur={MODALS.SHORTCUT_MODALS.NOTES ? null : () => {
              //   console.log(note);
              //   props.onSpotEdit('notes', note);
              //   // props.setNoteTimestamp(date);
              // }}
            />
          </View>
          <View style={{alignContent: 'flex-end'}}>
            <Button
              title={'Save Note'}
              onPress={() => saveNote()}
              color={'red'}
              type={'solid'}
              containerStyle={{paddingBottom: 10, paddingTop: 20}}
              buttonStyle={{borderRadius: 10, backgroundColor: 'red'}}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderNotebookView()}
    </View>

  );
};

export default Notes;
