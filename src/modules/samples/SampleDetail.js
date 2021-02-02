import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import styles from '../samples/samples.style';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';

const SampleDetailPage = () => {
  const dispatch = useDispatch();
  const [useForm] = useFormHook();
  const [formName, setFormName] = useState([]);
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedSample = useSelector(state => state.spot.selectedAttributes[0]);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const form = useRef(null);

  useEffect(() => {
    console.log('In SampleDetailPage useEffect', selectedSample);
    setFormName(['general', 'sample']);
  }, []);

  useEffect(() => {
    console.log('UE for selectedSample changed in SampleDetailPage');
    if (!selectedSample) dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.SAMPLE));
  }, [selectedSample]);

  // Delete a sample
  const deleteSample = () => {
    let samplesDataCopy = JSON.parse(JSON.stringify(spot.properties.samples));
    samplesDataCopy.forEach((sample, i) => {
      if (selectedSample.id === sample.id) samplesDataCopy[i] = {};
    });
    samplesDataCopy = samplesDataCopy.filter(sample => !isEmpty(sample));
    dispatch(editedSpotProperties({field: 'samples', value: samplesDataCopy}));
    dispatch(setNotebookPageVisibleToPrev());
  };

  const onSubmitForm = () => {
    console.log('OnSubmit Executed');
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => dispatch(setNotebookPageVisibleToPrev())}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const renderFormFields = () => {
    console.log('Rendering form:', formName[0] + '.' + formName[1], 'with selected sample ', selectedSample);
    return (
      <View>
        <SectionDivider dividerText='Sample'/>
        <View style={{flex: 1}}>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={selectedSample}
            validateOnChange={false}
            enableReinitialize={true}
          />
        </View>
      </View>
    );
  };

  const saveForm = async () => {
    return form.current.submitForm().then(() => {
      if (useForm.hasErrors(form.current)) {
        useForm.showErrors(form.current);
        return Promise.reject();
      }
      let samplesDataCopy = JSON.parse(JSON.stringify(spot.properties.samples));
      let formValues = {...form.current.values};
      let editedSelectedSample = [];
      samplesDataCopy.forEach((sample, i) => {
        if (selectedSample.id === sample.id) {
          samplesDataCopy[i] = {...sample, ...formValues};
          editedSelectedSample.push(samplesDataCopy[i]);
        }
      });
      dispatch(setSelectedAttributes(editedSelectedSample));
      dispatch(editedSpotProperties({field: 'samples', value: samplesDataCopy}));
      return Promise.resolve();
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = async () => {
    try {
      await saveForm();
      console.log('Finished saving form data to Spot');
      dispatch(setNotebookPageVisibleToPrev());
    }
    catch (err) {
      console.log('Error saving form data to Spot');
    }
  };

  return (
    <React.Fragment>
      {selectedSample && (
        <View style={styles.sampleContentContainer}>
          {renderCancelSaveButtons()}
          <FlatList
            ListHeaderComponent={
              <View>
                {!isEmpty(formName) && renderFormFields()}
                <Button
                  titleStyle={{color: themes.RED}}
                  title={'Delete Sample'}
                  type={'clear'}
                  onPress={() => deleteSample()}
                />
              </View>
            }
          />
        </View>
      )}
    </React.Fragment>
  );
};

export default SampleDetailPage;
