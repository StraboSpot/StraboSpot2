import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {PAGE_KEYS} from './page.constants';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import {Form, useFormHook} from '../form';
import NoteForm from '../notes/NoteForm';
import usePetrologyHook from '../petrology/usePetrology';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {LITHOLOGY_SUBPAGES} from '../sed/sed.constants';
import useSedHook from '../sed/useSed';
import {useSpotsHook} from '../spots';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import {useTagsHook} from '../tags';

const BasicPageDetail = ({
                           closeDetailView,
                           deleteTemplate,
                           groupKey = 'general',
                           page,
                           selectedFeature,
                           saveTemplate,
                         }) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const useForm = useFormHook();
  const usePetrology = usePetrologyHook();
  const useSed = useSedHook();
  const useSpots = useSpotsHook();
  const useTags = useTagsHook();

  const formRef = useRef(null);

  const pageKey = page.key === PAGE_KEYS.FABRICS && selectedFeature.type === 'fabric' ? '_3d_structures'
    : page.key === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY ? PAGE_KEYS.LITHOLOGIES : page.key;
  let pageData = pageKey === PAGE_KEYS.NOTES ? {} : [];
  if (spot && spot.properties) {
    if (spot.properties[groupKey] && spot.properties[groupKey][pageKey]) pageData = spot.properties[groupKey][pageKey];
    else if (spot.properties[pageKey]) pageData = spot.properties[pageKey];
  }
  const title = groupKey === 'pet' && pageKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS
  && !selectedFeature.rock_type && selectedFeature.igneous_rock_class
    ? toTitleCase(selectedFeature.igneous_rock_class.replace('_', ' ') + ' Rock')
    : page.label_singular || toTitleCase(page.label).slice(0, -1);

  const isTemplate = saveTemplate;

  useLayoutEffect(() => {
    console.log('ULE BasicPageDetail []');
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE BasicPageDetail []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  useEffect(() => {
    console.log('UE BasicPageDetail [selectedFeature]', selectedFeature);
    if (!isTemplate && isEmpty(selectedFeature)) closeDetailView();
  }, [selectedFeature]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    closeDetailView();
  };

  const confirmLeavePage = () => {
    if (!isTemplate && formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [{
          text: 'No',
          style: 'cancel',
        }, {
          text: 'Yes',
          onPress: () => saveForm(formCurrent),
        }],
        {cancelable: false},
      );
    }
  };

  const deleteFeature = () => {
    useTags.deleteFeatureTags([selectedFeature]);
    if (groupKey === 'pet') usePetrology.deletePetFeature(pageKey, spot, selectedFeature);
    else if (groupKey === 'sed') useSed.deleteSedFeature(pageKey, spot, selectedFeature);
    else {
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== selectedFeature.id);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));
    }
    dispatch(setSelectedAttributes([]));
    closeDetailView();
  };

  const deleteFeatureConfirm = () => {
    alert('Delete ' + title,
      'Are you sure you would like to delete this ' + title + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteFeature(),
        },
      ],
      {cancelable: false},
    );
  };

  const getFormName = () => {
    let formName = [groupKey, pageKey];
    if (groupKey === 'pet' && selectedFeature.rock_type) formName = ['pet_deprecated', pageKey];
    else if (groupKey === 'pet' && pageKey === 'igneous') formName = [groupKey, selectedFeature.igneous_rock_class];
    else if (pageKey === '_3d_structures' || pageKey === 'fabrics') formName = [pageKey, selectedFeature.type];
    else if (page.subkey) formName = [pageKey, page.subkey];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    return formName;
  };

  const renderFormFields = () => {
    const formName = getFormName();
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={values => useForm.validateForm({formName: formName, values: values})}
          initialValues={selectedFeature}
          initialStatus={{formName: formName}}
          enableReinitialize={true}
        >
          {formProps => (
            <Form {...{
              ...formProps,
              formName: formName,
              onMyChange: page.key === PAGE_KEYS.MINERALS
                ? ((name, value) => usePetrology.onMineralChange(formRef.current, name, value))
                : page.key === LITHOLOGY_SUBPAGES.LITHOLOGY
                  ? ((name, value) => useSed.onSedFormChange(formRef.current, name, value))
                  : undefined,
            }}/>
          )}
        </Formik>
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + title + (isTemplate ? ' Template' : '')}
          type={'clear'}
          onPress={() => isTemplate ? deleteTemplate() : deleteFeatureConfirm()}
        />
      </View>
    );
  };

  const renderNotesField = () => {
    return (
      <View style={{flex: 1}}>
        <NoteForm
          formRef={formRef}
          initialNotesValues={selectedFeature}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + title + (isTemplate ? ' Template' : '')}
          type={'clear'}
          onPress={() => isTemplate ? deleteTemplate() : deleteFeatureConfirm()}
        />
      </View>
    );
  };

  const saveFeature = async (formCurrent) => {
    try {
      await formCurrent.submitForm();
      const editedFeatureData = useForm.showErrors(formRef.current || formCurrent, isEmpty(formRef.current));
      console.log('Saving', page.label, 'data', editedFeatureData, 'to Spot', pageData);
      let editedPageData = pageData ? JSON.parse(JSON.stringify(pageData)) : [];
      editedPageData = editedPageData.filter(f => f.id !== editedFeatureData.id);
      editedPageData.push(editedFeatureData);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedPageData}));

      if (page.key === PAGE_KEYS.SAMPLES && editedFeatureData.sample_id_name) {
        await useSpots.checkSampleName(editedFeatureData.sample_id_name);
      }
    }
    catch (err) {
      console.log('Error saving', pageKey, err);
      throw Error;
    }
  };

  const saveForm = async (formCurrent) => {
    try {
      if (groupKey === 'pet') {
        await usePetrology.savePetFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else if (groupKey === 'sed' && pageKey === 'bedding') {
        await useSed.saveSedBedFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else if (groupKey === 'sed') {
        await useSed.saveSedFeature(pageKey, spot, formRef.current || formCurrent, isEmpty(formRef.current));
      }
      else await saveFeature(formCurrent);
      await formCurrent.resetForm();
      closeDetailView();
    }
    catch (err) {
      console.error('ERROR saving form', err);
    }
  };

  const saveTemplateForm = async (formCurrent) => {
    await formCurrent.submitForm();
    const formValues = useForm.showErrors(formRef.current || formCurrent, isEmpty(formRef.current));
    saveTemplate(formValues);
  };

  return (
    <>
      {(isTemplate || !isEmpty(selectedFeature)) && (
        <React.Fragment>
          <SaveAndCancelButtons
            cancel={cancelForm}
            save={() => isTemplate ? saveTemplateForm(formRef.current) : saveForm(formRef.current)}
          />
          <FlatList
            ListHeaderComponent={page?.key === PAGE_KEYS.NOTES ? renderNotesField() : renderFormFields()}/>
        </React.Fragment>
      )}
    </>
  );
};

export default BasicPageDetail;
