import React, {useRef} from 'react';
import {Alert, View} from 'react-native';

import {Field, Formik} from 'formik';
import {Button, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import Modal from '../../../shared/ui/modal/Modal';
import SaveAndCloseButtons from '../../../shared/ui/SaveAndCloseButtons';
import {DateInputField, TextInputField} from '../../form';
import {setModalValues, setModalVisible} from '../../home/home.slice';
import {updatedProject} from '../projects.slice';

const DailyNotesModal = () => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const projectDescription = useSelector(state => state.project.project.description);

  const formRef = useRef(null);

  const initialValues = {...modalValues, date: modalValues.date || new Date().toISOString()};

  const close = () => {
    dispatch(setModalValues({}));
    dispatch(setModalVisible({modal: null}));
  };

  const deleteNote = (values) => {
    const dailyNotes = JSON.parse(JSON.stringify(projectDescription.daily_setup || []));
    const dailyNotesFiltered = dailyNotes.filter(n => n.date !== values.date);
    let projectDescriptionUpdated = JSON.parse(JSON.stringify(projectDescription));
    if (isEmpty(dailyNotesFiltered)) delete projectDescriptionUpdated.daily_setup;
    else projectDescriptionUpdated = {...projectDescription, daily_setup: dailyNotesFiltered};
    dispatch(updatedProject({field: 'description', value: projectDescriptionUpdated}));
    dispatch(setModalValues({}));
    dispatch(setModalVisible({modal: null}));
  };

  const deleteNoteConfirm = () => {
    Alert.alert('Delete Note',
      'Are you sure you would like to delete this note?',
      [
        {text: 'No', style: 'cancel'},
        {text: 'Yes', onPress: () => deleteNote(formRef?.current?.values)},
      ],
      {cancelable: false},
    );
  };

  const saveNote = (values) => {
    const dailyNotes = JSON.parse(JSON.stringify(projectDescription.daily_setup || []));
    const dailyNotesFiltered = dailyNotes.filter(n => n.date !== values.date);
    const dailyNotesUpdated = [...dailyNotesFiltered, values];
    const projectDescriptionUpdated = {...projectDescription, daily_setup: dailyNotesUpdated};
    dispatch(updatedProject({field: 'description', value: projectDescriptionUpdated}));
    dispatch(setModalValues({}));
    dispatch(setModalVisible({modal: null}));
  };

  const renderDailyNotesModal = () => {
    return (
      <Modal
        buttonTitleRight={''}
      >
        <SaveAndCloseButtons
          cancel={() => close()}
          save={() => saveNote(formRef?.current?.values)}
        />
        <Formik
          initialValues={initialValues}
          onSubmit={() => console.log('Submitting form...')}
          innerRef={formRef}
          validateOnChange={true}
          enableReinitialize={true}
        >
          {() => (
            <View>
              <ListItem containerStyle={commonStyles.listItemFormField}>
                <ListItem.Content>
                  <Field
                    component={DateInputField}
                    name={'date'}
                    label={'Date'}
                    key={'date'}
                    isShowTime={true}
                    isDisplayOnly={true}
                  />
                </ListItem.Content>
              </ListItem>
              <FlatListItemSeparator/>
              <ListItem containerStyle={commonStyles.listItemFormField}>
                <ListItem.Content>
                  <Field
                    component={TextInputField}
                    name={'notes'}
                    label={'Notes'}
                    key={'notes'}
                    appearance={'multiline'}
                  />
                </ListItem.Content>
              </ListItem>
              <Button
                title={'Delete Note'}
                titleStyle={{color: 'red'}}
                type={'clear'}
                onPress={() => deleteNoteConfirm()}
                icon={
                  <Icon
                    iconStyle={{paddingRight: 10}}
                    name={'trash'}
                    type={'font-awesome'}
                    size={20}
                    color={'red'}
                  />
                }
              />
            </View>
          )}
        </Formik>
      </Modal>
    );
  };

  return renderDailyNotesModal();
};

export default DailyNotesModal;
