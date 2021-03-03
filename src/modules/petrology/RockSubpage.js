import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, SelectInputField, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const RockSubpage = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const [useSpots] = useSpotsHook();

  const [spotsWithPet, setSpotsWithPet] = useState([]);
  const [petData, setPetData] = useState(spot.properties.pet || {});

  const formRef = useRef(null);
  const preFormRef = useRef(null);

  useEffect(() => {
    getSpotsWithPetrology();
    return () => confirmLeavePage();
  }, []);

  const cancelForm = async () => {
    if (formRef.current.dirty) Alert.alert('Data Reset', 'Rock data for Spot reset.');
    setPetData(spot.properties.pet || {});
    await formRef.current.resetForm();
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

  const copyPetData = (spotId) => {
    const spotToCopy = useSpots.getSpotById(spotId);

    const copyPetDataContinued = () => {
      const copiedPetData = JSON.parse(JSON.stringify(spotToCopy.properties.pet));
      delete copiedPetData.reactions;
      copiedPetData.minerals && copiedPetData.minerals.each((mineral, i) => {
        if (mineral.modal) delete copiedPetData.minerals[i].modal;
      });
      setPetData(copiedPetData);
      formRef.current.resetForm();
      preFormRef.current.resetForm();
    };

    if (!isEmpty(spotToCopy)) {
      console.log('Copying Petrology from Spot:', spotToCopy);
      if (!isEmpty(spot.properties.pet)) {
        Alert.alert('Overwrite Existing Data',
          'Are you sure you want to overwrite the current Petrology Rock and Mineral data '
          + 'with the Rock and Mineral data from ' + spotToCopy.properties.name + '?',
          [
            {
              text: 'No',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => copyPetDataContinued(),
            },
          ],
          {cancelable: false},
        );
      }
      else copyPetDataContinued();
    }
  };

  const getSpotsWithPetrology = () => {
    const allSpotsWithPet = useSpots.getSpotsWithPetrology();
    setSpotsWithPet(allSpotsWithPet.filter(s => s.properties.id !== spot.properties.id));
  };

  const renderFormFields = () => {
    const formName = ['pet', 'rock'];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={preFormRef}
          validate={(fieldValues) => copyPetData(fieldValues.spot_id_for_pet_copy)}
          validateOnChange={true}
          initialValues={{}}
        >
          <ListItem containerStyle={commonStyles.listItemFormField}>
            <ListItem.Content>
              <Field
                component={(formProps) => (
                  SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
                )}
                name={'spot_id_for_pet_copy'}
                key={'spot_id_for_pet_copy'}
                label={'Copy Petrology Ig/Met Data:'}
                choices={spotsWithPet.map(s => ({label: s.properties.name, value: s.properties.id}))}
                single={true}
              />
            </ListItem.Content>
          </ListItem>
        </Formik>
        <Formik
          innerRef={formRef}
          onSubmit={(values) => console.log('Submitting form with', values)}
          onReset={(values) => console.log('Resetting form to', values)}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={petData}
          validateOnChange={true}
          enableReinitialize={true}
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
      console.log('Saving form data to Spot ...');
      let editedPetData = formCurrent.values;
      setPetData(editedPetData);
      dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
      await formCurrent.resetForm();
      Alert.alert('Data Saved', 'Rock data saved to Spot.');
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

export default RockSubpage;
