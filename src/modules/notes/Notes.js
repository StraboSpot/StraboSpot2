import React, {useLayoutEffect, useRef, useState} from 'react';
import {Alert, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import uiStyles from '../../shared/ui/ui.styles';
import {MODAL_KEYS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS, PRIMARY_PAGES} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';
import Templates from '../templates/Templates';
import NoteForm from './NoteForm';

const Notes = (props) => {
  const dispatch = useDispatch();
  const initialNote = useSelector(state => state.spot.selectedSpot?.properties?.notes || null);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [initialNotesValues, setInitialNotesValues] = useState({note: initialNote});
  const [isShowTemplates, setIsShowTemplates] = useState(false);

  const [useMaps] = useMapsHook();

  const formRef = useRef(null);
  const page = PRIMARY_PAGES.find(p => p.key === PAGE_KEYS.NOTES);

  useLayoutEffect(() => {
    console.log('ULE Notes [templates]', templates);
    if (isEmpty(initialNote) && templates.notes && templates.notes.isInUse && !isEmpty(templates.notes.active)) {
      const templatesNotes = templates.notes.active.map(t => t.values.note).join('\n');
      setInitialNotesValues({note: templatesNotes});
    }
    return () => confirmLeavePage();
  }, [templates]);

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your notes before continuing?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: () => saveForm(formCurrent, false)},
        ],
        {cancelable: false},
      );
    }
  };

  const saveForm = async (currentForm, pageTransition) => {
    try {
      if (modalVisible === MODAL_KEYS.SHORTCUTS.NOTE) {
        const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
        console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
      }
      await currentForm.submitForm();
      await saveNote(currentForm.values.note, pageTransition);
      await currentForm.resetForm();
      if (props.goToCurrentLocation) await props.goToCurrentLocation();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  const saveNote = async (note, pageTransition) => {
    dispatch(editedSpotProperties({field: 'notes', value: note}));
    dispatch(setSelectedSpotNotesTimestamp());
    if (pageTransition) dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
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
            <Templates
              isShowTemplates={isShowTemplates}
              setIsShowTemplates={bool => setIsShowTemplates(bool)}
              page={page}
            />
            {!isShowTemplates && (
              <SaveAndCloseButton
                cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
                save={() => saveForm(formRef.current, true)}
              />
            )}
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
    </View>
  );
};

export default Notes;
