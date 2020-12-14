import React, {useEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const MineralDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useEffect(() => {
    return () => confirmLeavePage();
  }, []);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.showMineralsOverview();
  };

  const confirmLeavePage = () => {
    if (formRef.current.dirty) {
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

  const deleteMineral = () => {
    let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};
    if (!editedPetData.minerals) editedPetData.minerals = [];
    editedPetData.minerals = editedPetData.minerals.filter(mineral => mineral.id !== props.selectedMineral.id);
    if (isEmpty(editedPetData.minerals)) delete editedPetData.minerals;
    dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
    //await formRef.current.resetForm();
    props.showMineralsOverview();
  };

  const deleteMineralConfirm = () => {
    Alert.alert('Delete Mineral',
      'Are you sure you would like to delete this mineral?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteMineral(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    const formName = ['pet', 'minerals'];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    console.log('Mineral Data:', props.selectedMineral);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={props.selectedMineral}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete Mineral'}
          type={'clear'}
          onPress={() => deleteMineralConfirm()}
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
      console.log('Saving mineral data to Spot ...');
      let editedMineralData = formCurrent.values;
      let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};
      if (!editedPetData.minerals) editedPetData.minerals = [];
      editedPetData.minerals = editedPetData.minerals.filter(mineral => mineral.id !== editedMineralData.id);
      editedPetData.minerals.push(editedMineralData);
      dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
      await formRef.current.resetForm();
      props.showMineralsOverview();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return (
    <React.Fragment>
      <SaveAndCloseButton
        cancel={() => cancelForm()}
        save={() => saveForm(formRef.current)}
      />
      <FlatList ListHeaderComponent={renderFormFields()}/>
    </React.Fragment>
  );
};

export default MineralDetail;
