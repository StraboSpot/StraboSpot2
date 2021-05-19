import React, {useLayoutEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const RockDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.showRocksOverview();
  };

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => saveForm(formCurrent),
          },
        ],
        {cancelable: false},
      );
    }
  };

  const deleteRock = () => {
    let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : [];
    // Delete SS1 style rock data of given type
    if (props.selectedRock.rock_type) {
      const survey = useForm.getSurvey(['pet_deprecated', props.type]);
      survey.forEach(f => delete editedPetData[f.name]);
      editedPetData.rock_type = editedPetData.rock_type.filter(t => t !== props.type);
      if (isEmpty(editedPetData.rock_type)) delete editedPetData.rock_type;
    }
    // Delete SS2 rock
    else {
      editedPetData[props.type] = editedPetData[props.type].filter(f => f.id !== props.selectedRock.id);
      if (isEmpty(editedPetData[props.type])) delete editedPetData[props.type];
    }
    dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
    props.showRocksOverview();
  };

  const deleteRockConfirm = () => {
    let deleteButtonText = props.selectedRock.rock_type ? props.type
      : props.type === 'igneous' ? props.selectedRock.igneous_rock_class
        : props.type;
    if (deleteButtonText === 'alteration_or') deleteButtonText = 'Alteration, Ore';
    Alert.alert('Delete ' + toTitleCase(deleteButtonText.replace('_', ' ') + ' Rock'),
      'Are you sure you would like to delete this ' + deleteButtonText.replace('_', ' ') + ' rock?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteRock(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    const formName = props.selectedRock.rock_type ? ['pet_deprecated', props.type]
      : props.type === 'igneous' ? ['pet', props.selectedRock.igneous_rock_class]
        : ['pet', props.type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    console.log(toTitleCase(props.type) + ' Data:', props.selectedRock);
    let deleteButtonText = props.selectedRock.rock_type ? props.type
      : props.type === 'igneous' ? props.selectedRock.igneous_rock_class
        : props.type;
    if (deleteButtonText === 'alteration_or') deleteButtonText = 'Alteration, Ore';
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => (
            <Form {...formProps} {...{formName: formName}}/>
          )}
          initialValues={props.selectedRock}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + toTitleCase(deleteButtonText.replace('_', ' ') + ' Rock')}
          type={'clear'}
          onPress={() => deleteRockConfirm()}
        />
      </View>
    );
  };

  const saveForm = async (formCurrent) => {
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      let editedRockData = formCurrent.values;
      if (props.selectedRock.rock_type) dispatch(editedSpotProperties({field: 'pet', value: editedRockData}));
      else {
        let editedRocksData = spot?.properties?.pet && spot?.properties?.pet[props.type]
          ? JSON.parse(JSON.stringify(spot.properties.pet[props.type]))
          : [];
        editedRocksData = editedRocksData.filter(f => f.id !== editedRockData.id);
        editedRocksData.push(editedRockData);
        dispatch(editedSpotProperties({field: 'pet', value: {...spot.properties.pet || {}, [props.type]: editedRocksData}}));
      }
      await formRef.current.resetForm();
      props.showRocksOverview();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return (
    <React.Fragment>
      {!isEmpty(props.selectedRock) && (
        <React.Fragment>
          <SaveAndCloseButton
            cancel={() => cancelForm()}
            save={() => saveForm(formRef.current)}
          />
          <FlatList ListHeaderComponent={renderFormFields()}/>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default RockDetail;
