import React, {useState, useEffect} from 'react';
import {Text, TextInput, View} from 'react-native';

import {Button} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import uiStyles from '../../shared/ui/ui.styles';
import {Modals} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {notebookReducers, NotebookPages} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {spotReducers} from '../spots/spot.constants';
import noteStyles from './notes.styles';

const Notes = (props) => {
  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spots = useSelector(state => state.spots);

  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
      console.log('In Notes Modal view');
    }
    else if (props.selectedSpot.properties.notes) {
      console.log('selectedSpot.properties', props.selectedSpot.properties);
      setNote(props.selectedSpot.properties.notes);
    }
  }, []);

  // useEffect(() => {
  //   if (isEmpty(props.selectedSpot.properties.notes)) {
  //     setNote(props.selectedSpot.properties.notes);
  //   }
  // },[props.selectedSpot]);

  let timeStamp = Date();

  const saveNote = async () => {
    if (modalVisible === Modals.SHORTCUT_MODALS.NOTES) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    console.log(note);
    dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'notes', value: note});
    dispatch({type: spotReducers.SET_SELECTED_SPOT_NOTES_TIMESTAMP});
    setNote('');
    dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
  };

  // const setPointToCurrentLocation = async () => {
  //   const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
  //   console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
  //   props.selectedSpot.properties.notes = new Date().toDateString() + '- ';
  // };

  const renderNotebookView = () => {
    return (
      <View>
        {modalVisible === Modals.SHORTCUT_MODALS.NOTES ?
          <View style={uiStyles.alignItemsToCenter}>
            <Text>Saving a note will create</Text>
            <Text>a new spot.</Text>
          </View>
          : <ReturnToOverviewButton
          onPress={() => props.setNotebookPageVisible(NotebookPages.OVERVIEW)}
        />}
        <View style={noteStyles.container}>
          {/*{!isEmpty(props.selectedSpot) ? <Text>{props.selectedSpot.properties.notes}</Text> : <Text>'No Note'</Text>}*/}
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
              // onBlur={Modals.SHORTCUT_MODALS.NOTES ? null : () => {
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

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Notes);
