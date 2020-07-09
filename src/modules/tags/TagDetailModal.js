import React, {useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, formStyles, useFormHook} from '../form';
import {projectReducers} from '../project/project.constants';
import {tagsStyles} from './index';

const TagDetailModal = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const tags = useSelector(state => state.project.project.tags);

  const [useForm] = useFormHook();
  const form = useRef(null);

  // What happens after submitting the form is handled in saveFormAndClose since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => props.closeModal()}
          save={() => saveFormAndClose()}
        />
      </View>
    );
  };

  const renderTagForm = () => {
    const formName = ['project', 'tags'];
    console.log('Rendering form: tag', selectedTag);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={form}
          onSubmit={onSubmitForm}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={selectedTag}
          validateOnChange={false}
          enableReinitialize={true}
        />
      </View>
    );
  };

  const saveForm = async () => {
    try {
      await form.current.submitForm();
      if (useForm.hasErrors(form)) {
        useForm.showErrors(form);
        return Promise.reject();
      }
      else {
        console.log('Saving tag data to Project ...');
        console.log('Form values', form.current.values);
        let updatedTags = tags.filter(tag => tag.id !== selectedTag.id);
        let updatedTag = form.current.values;
        if (!updatedTag.id) updatedTag.id = getNewId();
        updatedTags.push(updatedTag);
        dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
        return Promise.resolve();
      }
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  const saveFormAndClose = () => {
    saveForm().then(() => {
      console.log('Finished saving tag data');
      props.closeModal();
    }, () => {
      console.log('Error saving tag data');
    });
  };

  return (
    <Dialog
      dialogTitle={<DialogTitle title={isEmpty(selectedTag) ? 'Add a New Tag' : selectedTag.name}/>}
      visible={props.isVisible}
      width={350}
      dialogStyle={tagsStyles.modalView}>
      <DialogContent>
        {renderCancelSaveButtons()}
        <FlatList style={formStyles.formContainer}
                  ListHeaderComponent={renderTagForm()}/>
      </DialogContent>
    </Dialog>
  );
};

export default TagDetailModal;
