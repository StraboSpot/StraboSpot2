import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const SampleDetailPage = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE Rendered SampleDetailPage\nSelectedSample:', props.selectedSample);
    if (isEmpty(props.selectedSample)) props.closeDetailView();
  }, [props.selectedSample]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.closeDetailView();
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
      if (props.selectedSample.id === sample.id) samplesDataCopy[i] = {};
    });
    samplesDataCopy = samplesDataCopy.filter(sample => !isEmpty(sample));
    dispatch(editedSpotProperties({field: 'samples', value: samplesDataCopy}));
    dispatch(setNotebookPageVisibleToPrev());
  };

  const renderFormFields = () => {
    const formName = ['general', props.page.key];
    console.log('Rendering form:', formName[0] + '.' + formName[1], 'with selected sample ', props.selectedSample);
    return (
      <View>
        <SectionDivider dividerText='Sample'/>
        <View style={{flex: 1}}>
          <Formik
            innerRef={formRef}
            onSubmit={() => console.log('Submitting form...')}
            onReset={() => console.log('Resetting form...')}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={props.selectedSample}
            validateOnChange={false}
            enableReinitialize={true}
          />
        </View>
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete Sample'}
          type={'clear'}
          onPress={() => deleteSample()}
        />
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
    let samplesDataCopy = JSON.parse(JSON.stringify(spot.properties[props.page.key]));
    let formValues = {...formCurrent.values};
    samplesDataCopy.forEach((sample, i) => {
      if (props.selectedSample.id === sample.id) samplesDataCopy[i] = {...sample, ...formValues};
    });
    dispatch(editedSpotProperties({field: props.page.key, value: samplesDataCopy}));
    await formCurrent.resetForm();
    console.log('Finished saving form data to Spot');
    props.closeDetailView();
  };

  return (
    <React.Fragment>
      {!isEmpty(props.selectedSample) && (
        <React.Fragment>
          <SaveAndCloseButton
            cancel={cancelForm}
            save={() => saveForm(formRef.current)}
          />
          <FlatList ListHeaderComponent={renderFormFields()}/>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default SampleDetailPage;
