import React, {useEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const MineralReactionDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useEffect(() => {
    return () => confirmLeavePage();
  }, []);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.showMineralsReactionsOverview();
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

  const deleteMineralReaction = () => {
    let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};
    if (!editedPetData[props.type]) editedPetData[props.type] = [];
    editedPetData[props.type] = editedPetData[props.type].filter(type => type.id !== props.selectedMineralReaction.id);
    if (isEmpty(editedPetData[props.type])) delete editedPetData[props.type];
    dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
    //await formRef.current.resetForm();
    props.showMineralsReactionsOverview();
  };

  const deleteMineralReactionConfirm = () => {
    Alert.alert('Delete ' + toTitleCase(props.type).slice(0, -1),
      'Are you sure you would like to delete this ' + props.type.slice(0, -1) + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteMineralReaction(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    const formName = ['pet', props.type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    console.log(toTitleCase(props.type) + ' Data:', props.selectedMineralReaction);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={props.selectedMineralReaction}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + toTitleCase(props.type).slice(0, -1)}
          type={'clear'}
          onPress={() => deleteMineralReactionConfirm()}
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
      console.log('Saving ' + props.type + ' data to Spot ...');
      let editedMineralReactionData = formCurrent.values;
      let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};
      if (!editedPetData[props.type]) editedPetData[props.type] = [];
      editedPetData[props.type] = editedPetData[props.type].filter(type => type.id !== editedMineralReactionData.id);
      editedPetData[props.type].push(editedMineralReactionData);
      dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
      await formRef.current.resetForm();
      props.showMineralsReactionsOverview();
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

export default MineralReactionDetail;
