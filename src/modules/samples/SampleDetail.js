import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

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
  const formRef = useRef(null);

  useEffect(() => {
    console.log('In SampleDetailPage useEffect', selectedSample);
    setFormName(['general', 'sample']);
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE for selectedSample changed in SampleDetailPage');
    if (!selectedSample) dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.SAMPLE));
  }, [selectedSample]);

  const cancelFormAndGo = async () => {
    await formRef.current.resetForm();
    dispatch(setNotebookPageVisibleToPrev());
  };

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
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
          cancel={cancelFormAndGo}
          save={saveFormAndGo}
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
            innerRef={formRef}
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

  const saveForm = async (formCurrent) => {
    await formCurrent.submitForm();
    if (useForm.hasErrors(formCurrent)) {
      useForm.showErrors(formCurrent);
      console.log('Found validation errors.');
      throw Error;
    }
    let samplesDataCopy = JSON.parse(JSON.stringify(spot.properties.samples));
    let formValues = {...formCurrent.values};
    let editedSelectedSample = [];
    samplesDataCopy.forEach((sample, i) => {
      if (selectedSample.id === sample.id) {
        samplesDataCopy[i] = {...sample, ...formValues};
        editedSelectedSample.push(samplesDataCopy[i]);
      }
    });
    dispatch(setSelectedAttributes(editedSelectedSample));
    dispatch(editedSpotProperties({field: 'samples', value: samplesDataCopy}));
    await formCurrent.resetForm();
    console.log('Finished saving form data to Spot');
  };

  const saveFormAndGo = async () => {
    try {
      await saveForm(formRef.current);
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
