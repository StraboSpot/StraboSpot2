import React, {useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS, SECONDARY_PAGES} from '../page/page.constants';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties, setSelectedSpotNotesTimestamp} from '../spots/spots.slice';

const SiteSafetyPage = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);
  const page = SECONDARY_PAGES.find(p => p.key === PAGE_KEYS.SITE_SAFETY);
  const formName = ['general', 'site_safety'];

  const cancelFormAndGo = () => {
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  const saveFormAndGo = async () => {
    try {
      await saveForm(formRef.current);
      dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  const saveForm = async (currentForm) => {
    try {
      await currentForm.submitForm();
      const editedSiteSafetyFormData = useForm.showErrors(currentForm);
      dispatch(editedSpotProperties({field: 'site_safety', value: editedSiteSafetyFormData}));
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(setSelectedSpotNotesTimestamp());
      await currentForm.resetForm();
    }
    catch (err) {
      console.log('Error submitting form', err);
      return Promise.reject();
    }
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => cancelFormAndGo()}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const renderSiteSafetyForm = () => {
    return (
      <Formik
        innerRef={formRef}
        onSubmit={values => console.log('Submitting form...', values)}
        onReset={() => console.log('Resetting form...')}
        validate={values => useForm.validateForm({formName: formName, values: values})}
        initialValues={spot.properties?.site_safety || {}}
        enableReinitialize={true}
        initialStatus={{formName: formName}}
      >
        {formProps => <Form {...{...formProps, formName: formName}}/>}
      </Formik>
    );
  };

  return (
    <React.Fragment>
      {renderCancelSaveButtons()}
      <FlatList
        ListHeaderComponent={
          <React.Fragment>
            <SectionDivider dividerText={page.label}/>
            {renderSiteSafetyForm()}
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};

export default SiteSafetyPage;
