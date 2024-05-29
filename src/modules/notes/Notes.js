import React, {useLayoutEffect, useRef, useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import NoteForm from './NoteForm';
import noteStyle from './notes.styles';
import {isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setLoadingStatus} from '../home/home.slice';
import useMapLocationHook from '../maps/useMapLocation';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {MODAL_KEYS, PAGE_KEYS, PRIMARY_PAGES} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedOrCreatedSpot, editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';
import Templates from '../templates/Templates';

const Notes = ({goToCurrentLocation}) => {
  const dispatch = useDispatch();
  const initialNote = useSelector(state => state.spot.selectedSpot?.properties?.notes) || undefined;
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spot = useSelector(state => state.spot.selectedSpot);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [initialNotesValues, setInitialNotesValues] = useState({note: initialNote});
  const [isShowTemplates, setIsShowTemplates] = useState(false);

  const toast = useToast();
  const useMapLocation = useMapLocationHook();

  const formRef = useRef(null);
  const page = PRIMARY_PAGES.find(p => p.key === PAGE_KEYS.NOTES);

  useLayoutEffect(() => {
    console.log('ULE Notes [templates]', templates);
    if (isEmpty(initialNote) && templates.notes && templates.notes.isInUse && !isEmpty(templates.notes.active)) {
      const templatesNotes = templates.notes.active.map(t => t.values.note).join('\n');
      setInitialNotesValues({note: templatesNotes});
    }
    return () => leavePage();
  }, [templates]);

  const leavePage = () => {
    if (formRef.current && formRef.current.dirty && modalVisible !== MODAL_KEYS.SHORTCUTS.NOTE) {
      const formCurrent = formRef.current;
      saveForm(formCurrent, false);
      if (Platform.OS !== 'web') toast.show('Notes saved', {type: 'success'});
    }
    else if (Platform.OS !== 'web') toast.show('No changes.');

  };

  const saveForm = async (currentForm, pageTransition) => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      if (modalVisible === MODAL_KEYS.SHORTCUTS.NOTE) {
        let pointSetAtCurrentLocation = await useMapLocation.setPointAtCurrentLocation();
        pointSetAtCurrentLocation = {
          ...pointSetAtCurrentLocation,
          properties: {
            ...pointSetAtCurrentLocation.properties,
            notes: currentForm.values.note,
          },
        };
        console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
        dispatch(updatedModifiedTimestampsBySpotsIds([pointSetAtCurrentLocation.properties.id]));
        dispatch(editedOrCreatedSpot(pointSetAtCurrentLocation));
      }
      else {
        await currentForm.submitForm();
        dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
        dispatch(setSelectedSpotNotesTimestamp());
        dispatch(editedSpotProperties({field: 'notes', value: currentForm.values.note}));
        await currentForm.resetForm();
      }
      if (pageTransition) dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
      else if (goToCurrentLocation) await goToCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      console.log('Error submitting form', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
  };

  return (
    <View style={{flex: 1}}>
      {modalVisible === MODAL_KEYS.SHORTCUTS.NOTE ? (
          <React.Fragment>
            {!isShowTemplates && (
              <View style={uiStyles.alignItemsToCenter}>
                <Text>Saving a note will create</Text>
                <Text>a new spot.</Text>
              </View>
            )}
            <Templates
              isShowTemplates={isShowTemplates}
              setIsShowTemplates={bool => setIsShowTemplates(bool)}
              page={page}
            />
          </React.Fragment>
        )
        : (
          <React.Fragment>
            {!isShowTemplates && <ReturnToOverviewButton/>}
            <View style={noteStyle.noteContainer}>
              <Templates
                isShowTemplates={isShowTemplates}
                setIsShowTemplates={bool => setIsShowTemplates(bool)}
                page={page}
              />
            </View>
          </React.Fragment>
        )
      }
      {!isShowTemplates && (
        <React.Fragment>
          <NoteForm
            formRef={formRef}
            initialNotesValues={initialNotesValues}
          />
          {modalVisible === MODAL_KEYS.SHORTCUTS.NOTE && (
            <SaveButton
              title={'Save Note'}
              onPress={() => saveForm(formRef.current, false)}
            />
          )}
        </React.Fragment>
      )}
      <Text style={noteStyle.messageText}>Notes will save automatically if you navigate away.</Text>
    </View>
  );
};

export default Notes;
