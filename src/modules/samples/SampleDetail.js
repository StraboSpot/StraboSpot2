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
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import styles from '../samples/samples.style';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';

const SampleDetailPage = (props) => {
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

  const cancelFormAndGo = () => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}));
    }
    dispatch(setNotebookPageVisibleToPrev());
  };

  // Delete a sample
  const deleteSample = () => {
    let samplesDataCopy = JSON.parse(JSON.stringify(spot.properties.samples));
    samplesDataCopy.forEach((sample, i) => {
      if (selectedSample.id === sample.id) samplesDataCopy[i] = {};
    });
    samplesDataCopy = samplesDataCopy.filter(sample => !isEmpty(sample));
    dispatch(editedSpotProperties({field: 'samples', value: samplesDataCopy}));
    if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
      dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}));
    }
    dispatch(setNotebookPageVisibleToPrev());
  };

  const onSubmitForm = () => {
    console.log('OnSubmit Executed');
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

  const renderFormFields = () => {
    console.log('Rendering form:', formName[0] + '.' + formName[1], 'with selected sample ', selectedSample);
    return (
      <View>
        <View style={styles.samplesSectionDividerContainer}>
          <SectionDivider dividerText='Sample'/>
        </View>
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
      const fieldsToExclude = ['id', 'label'];
      fieldsToExclude.forEach(key => delete formValues[key]);
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

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
        dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}));
      }
      dispatch(setNotebookPageVisibleToPrev());
    }, () => {
      console.log('Error saving form data to Spot');
    });
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
