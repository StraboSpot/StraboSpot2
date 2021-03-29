import React, {useLayoutEffect, useRef, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, SelectInputField, useFormHook} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const RockTypePage = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const [useSpots] = useSpotsHook();

  const [spotsWithRockType, setSpotsWithRockType] = useState([]);
  const [petData, setPetData] = useState(spot.properties.pet || {});

  const formRef = useRef(null);
  const preFormRef = useRef(null);

  useLayoutEffect(() => {
    console.log('Pet Data', petData);
    getSpotsWithRockType();
    return () => confirmLeavePage();
  }, []);

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
      const survey = useForm.getSurvey(['pet', props.type]);
      const fieldNames = survey.reduce((acc, field) => field.name ? [...acc, field.name] : acc, []);
      const petDataToCopyFiltered = Object.entries(spotToCopy.properties.pet).reduce((acc, [key, value]) => {
        return fieldNames.includes(key) ? {...acc, [key]: value} : acc;
      }, {});
      const petDataFiltered = Object.entries(petData).reduce((acc, [key, value]) => {
        return fieldNames.includes(key) ? acc : {...acc, [key]: value};
      }, {});
      const updatedRockType = petData.rock_type ? [...new Set([...petData.rock_type, props.type])] : [props.type];
      const updatedPetData = {...petDataFiltered, ...petDataToCopyFiltered, rock_type: updatedRockType};
      Object.keys(formRef.current.values).map(key => formRef.current.setFieldValue(key, undefined, false));
      Object.entries(updatedPetData).map(([key, value]) => formRef.current.setFieldValue(key, value, false));
      setPetData(updatedPetData);
      preFormRef.current.resetForm();
    };

    if (!isEmpty(spotToCopy)) {
      const title = props.type === 'alteration_or' ? 'Economic' : toTitleCase(props.type);
      console.log('Copying ' + title + 'data from Spot:', spotToCopy);
      const survey = useForm.getSurvey(['pet', props.type]);
      const fieldNames = survey.reduce((acc, field) => field.name ? [...acc, field.name] : acc, []);
      const petDataFiltered = Object.entries(petData).reduce((acc, [key, value]) => {
        return fieldNames.includes(key) ? {...acc, [key]: value} : acc;
      }, {});
      if (!isEmpty(petDataFiltered)) {
        Alert.alert('Overwrite Existing Data',
          'Are you sure you want to overwrite any current ' + title + ' data '
          + 'with the ' + title + ' data from ' + spotToCopy.properties.name + '?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => preFormRef.current.resetForm(),
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

  const getSpotsWithRockType = () => {
    const allSpotsWithPet = useSpots.getSpotsWithPetrology();
    setSpotsWithRockType(allSpotsWithPet.filter(s => s.properties.id !== spot.properties.id
      && s.properties?.pet?.rock_type.includes(props.type)));
  };

  const renderFormFields = () => {
    const formName = ['pet', props.type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    const label = 'Copy ' + (props.type === 'alteration_or' ? 'Economic' : toTitleCase(props.type)) + ' Data From:';
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
                label={label}
                choices={spotsWithRockType.map(s => ({label: s.properties.name, value: s.properties.id}))}
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
          enableReinitialize={false}
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
      const updatedRockType = petData.rock_type ? [...new Set([...petData.rock_type, props.type])] : [props.type];
      let editedPetData = {...formCurrent.values, rock_type: updatedRockType};
      setPetData(editedPetData);
      dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
      await formCurrent.resetForm();
      Alert.alert('Data Saved',
        (props.type === 'alteration_or' ? 'Economic' : toTitleCase(props.type) + ' Rock') + ' data saved to Spot.');
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />
      <SaveAndCloseButton
        cancel={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
        save={() => saveForm(formRef.current)}
      />
      <SectionDivider dividerText={props.type === 'alteration_or' ? 'Economic' : toTitleCase(props.type) + ' Rock'}/>
      <FlatList ListHeaderComponent={renderFormFields()}/>
    </React.Fragment>
  );
};

export default RockTypePage;
