import React, {useRef} from 'react';
import {Text, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty, truncateText} from '../../shared/Helpers';
import {Form, useFormHook, labelDictionary} from '../form';
import useMapsHook from '../maps/useMaps';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import {projectReducers} from '../project/project.constants';
import {tagsStyles} from './index';

const useTags = () => {
  const [useForm] = useFormHook();
  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const form = useRef(null);
  const addTagToSelectedSpot = useSelector(state => state.project.addTagToSelectedSpot);
  const projectTags = useSelector(state => state.project.project.tags || []);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedTag = useSelector(state => state.project.selectedTag);
  const tagsDictionary = labelDictionary.project.tags;

  const addRemoveSpotFromTag = (spotId) => {
    let selectedTagCopy = JSON.parse(JSON.stringify(selectedTag));
    if (selectedTagCopy.spots) {
      if (selectedTagCopy.spots.includes(spotId)) {
        selectedTagCopy.spots = selectedTagCopy.spots.filter(id => spotId !== id);
      }
      else selectedTagCopy.spots.push(spotId);
    }
    else {
      selectedTagCopy.spots = [];
      selectedTagCopy.spots.push(spotId);
    }
    saveTag(selectedTagCopy);
  };

  const deleteTag = (tagToDelete) => {
    let updatedTags = projectTags.filter(tag => tag.id !== tagToDelete.id);
    dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
    dispatch({type: projectReducers.SET_SELECTED_TAG, tag: {}});
  };

  const getLabel = (key) => {
    if (key) return tagsDictionary[key] || key.replace(/_/g, ' ');
    return 'No Type Specified';
  };

  const addRemoveTagFromSpot = (tag) => {
    if (!tag.spots) tag.spots = [];
    const i = tag.spots.indexOf(selectedSpot.properties.id);
    if (i === -1) tag.spots.push(selectedSpot.properties.id);
    else tag.spots.splice(i, 1);
    if (isEmpty(tag.spots)) delete tag.spots;
    saveTag(tag);
  };

  // Get Tags at a Spot given an Id or if no Id specified get tags at the selected Spot
  const getTagsAtSpot = (spotId) => {
    if (!spotId && !isEmpty(selectedSpot)) spotId = selectedSpot.properties.id;
    return projectTags.filter(tag => tag.spots && tag.spots.includes(spotId));
  };

  const getTagsAtSpotGeologicUnitFirst = (spotId) => {
    const tagsAtSpot = getTagsAtSpot(spotId);
    const tagsGeologicUnit = tagsAtSpot.filter(tag => tag.type === 'geologic_unit');
    const tagsOther = tagsAtSpot.filter(tag => tag.type !== 'geologic_unit');
    return [...tagsGeologicUnit, ...tagsOther];
  };

  const openSpotInNotebook = (spot) => {
    useMaps.setSelectedSpot(spot);
    dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
    dispatch({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: true});
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

  const renderTagInfo = () => {
    let type = selectedTag.type ? getLabel(selectedTag.type) : 'No type specified';
    if (selectedTag.type === 'other' && selectedTag.other_type) type = selectedTag.other_type;
    const subtypeFields = ['other_concept_type', 'other_documentation_type', 'concept_type', 'documentation_type'];
    const subTypeField = subtypeFields.find(subtype => selectedTag[subtype]);
    const subType = subTypeField ? getLabel(selectedTag[subTypeField]) : undefined;
    const rockUnitFields = ['unit_label_abbreviation', 'map_unit_name', 'member_name', 'rock_type'];
    let rockUnitString = rockUnitFields.reduce((acc, field) => {
      if (selectedTag[field]) return acc + (!isEmpty(acc) ? ' / ' : '') + selectedTag[field];
      else return acc;
    }, []);
    const notes = selectedTag.notes ? truncateText(selectedTag.notes, 100) : undefined;
    return (
      <View style={tagsStyles.sectionContainer}>
        {<Text style={tagsStyles.listText}>{type}{subType && ' - ' + subType.toUpperCase()}</Text>}
        {!isEmpty(rockUnitString) && <Text style={tagsStyles.listText}>{rockUnitString}</Text>}
        {notes && <Text style={tagsStyles.listText}>Notes: {notes}</Text>}
      </View>
    );
  };

  const renderTagForm = () => {
    const formName = ['project', 'tags'];
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
        let updatedTag = form.current.values;
        if (!updatedTag.id) updatedTag.id = getNewId();
        if (addTagToSelectedSpot) {
          if (!updatedTag.spots) updatedTag.spots = [];
          updatedTag.spots.push(selectedSpot.properties.id);
        }
        saveTag(updatedTag);
        return Promise.resolve();
      }
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  const saveTag = (tagToSave) => {
    const updatedTags = projectTags.filter(tag => tag.id !== tagToSave.id);
    updatedTags.push(tagToSave);
    dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
  };

  return [{
    addRemoveSpotFromTag: addRemoveSpotFromTag,
    addRemoveTagFromSpot: addRemoveTagFromSpot,
    deleteTag: deleteTag,
    getLabel: getLabel,
    getTagsAtSpot: getTagsAtSpot,
    getTagsAtSpotGeologicUnitFirst: getTagsAtSpotGeologicUnitFirst,
    openSpotInNotebook: openSpotInNotebook,
    renderSpotCount: renderSpotCount,
    renderTagInfo: renderTagInfo,
    renderTagForm: renderTagForm,
    saveForm: saveForm,
  }];
};

export default useTags;
