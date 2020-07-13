import React, {useRef} from 'react';
import {View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import {Form, useFormHook, labelDictionary} from '../form';
import {projectReducers} from '../project/project.constants';

const useTags = () => {
  const [useForm] = useFormHook();
  const dispatch = useDispatch();
  const form = useRef(null);
  const projectTags = useSelector(state => state.project.project.tags || []);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedTag = useSelector(state => state.project.selectedTag);
  const tagsDictionary = labelDictionary.project.tags;

  const getLabel = (key) => {
    return tagsDictionary[key] || key.replace(/_/g, ' ');
  };

  // Get Tags at a Spot given an Id or if no Id specified get tags at the selected Spot
  const getTagsAtSpot = (spotId) => {
    if (!spotId && !isEmpty(selectedSpot)) spotId = selectedSpot.properties.id;
    return projectTags.filter(tag => tag.spots && tag.spots.includes(spotId));
  };

  // What happens after submitting the form is handled in saveFormAndClose since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const renderSpotCount = (tag) => {
    if (tag.spots) {
      if (tag.spots.length === 1) return `${tag.spots.length} spot`;
      return `${tag.spots.length} spots`;
    }
    else return '0 spots';
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

  const save = (id, value) => {
    const tag = projectTags.find(tag => tag.id === id);
    tag.name = value;
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
        let updatedTags = projectTags.filter(tag => tag.id !== selectedTag.id);
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

  return [{
    getLabel: getLabel,
    getTagsAtSpot: getTagsAtSpot,
    renderSpotCount: renderSpotCount,
    renderTagForm: renderTagForm,
    save: save,
    saveForm: saveForm,
  }];
};

export default useTags;
