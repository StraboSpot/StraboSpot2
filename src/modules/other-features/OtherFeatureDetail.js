import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, TextInput, View} from 'react-native';

import {Field, Formik} from 'formik';
import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {formStyles, SelectInputField, TextInputField, useFormHook} from '../form';
import {DEFAULT_GEOLOGIC_TYPES} from '../project/project.constants';
import {addedCustomFeatureTypes} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const OtherFeatureDetail = (props) => {
  const dispatch = useDispatch();
  const [useForm] = useFormHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const projectFeatures = useSelector(state => state.project.project.other_features);

  const selectedFeature = props.selectedFeature;
  const customFeatureTypes = projectFeatures.filter(feature => !DEFAULT_GEOLOGIC_TYPES.includes(feature));
  let label = useState(selectedFeature.label === undefined ? '' : selectedFeature.label);
  let name = useState(selectedFeature.name === undefined ? '' : selectedFeature.name);
  let type = useState(selectedFeature.type === undefined ? '' : selectedFeature.type);
  let [otherType, setOtherType] = useState('');
  let description = useState(selectedFeature.description === undefined ? '' : selectedFeature.description);
  const formRef = useRef(null);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.hideFeatureDetail();
  };

  useEffect(() => {
    return () => confirmLeavePage();
  }, []);

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

  const deleteFeature = () => {
    let otherFeatures = spot.properties.other_features;
    let existingFeature = otherFeatures.filter(feature => feature.id === props.selectedFeature.id);
    if (!isEmpty(existingFeature)) {
      delete existingFeature[0];
      otherFeatures = otherFeatures.filter(feature => feature.id !== props.selectedFeature.id);
      dispatch(editedSpotProperties({field: 'other_features', value: otherFeatures}));
    }
    props.hideFeatureDetail();
  };

  const deleteFeatureConfirm = () => {
    Alert.alert('Delete Feature ' + toTitleCase(props.selectedFeature.name),
      'Are you sure you would like to delete ' + props.selectedFeature.name + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteFeature(),
        },
      ],
      {cancelable: false},
    );
  };

  const isOtherType = () => {
    if (type === 'other' || formRef.current && formRef.current.values.type === 'other') return true;
    else return false;
  };

  const onSubmitForm = () => {
    // No op
  };

  const saveForm = async (formCurrent) => {
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      let featureToEdit;
      let otherFeatures = spot.properties.other_features;
      if (!formCurrent.values.label) label = formCurrent.values.name;
      else label = formCurrent.values.label;
      name = formCurrent.values.name;
      description = formCurrent.values.description;
      if (isEmpty(formCurrent.values.type)) type = 'geomorphic';
      else type = formCurrent.values.type;
      if (otherFeatures && otherFeatures.length > 0) {
        let existingFeatures = otherFeatures.filter(feature => feature.id === props.selectedFeature.id);
        if (!isEmpty(existingFeatures)) {
          otherFeatures = otherFeatures.filter(feature => feature.id !== props.selectedFeature.id);
          featureToEdit = JSON.parse(JSON.stringify(existingFeatures[0]));
        }
        else {
          otherFeatures = JSON.parse(JSON.stringify(otherFeatures));
          featureToEdit = props.selectedFeature;
        }
      }
      else {
        otherFeatures = [];
        featureToEdit = props.selectedFeature;
      }
      if (updateFeature(featureToEdit, otherFeatures)) {
        await formRef.current.resetForm();
        props.hideFeatureDetail();
      }
    }
 catch (err) {
      console.log('Error submitting form', err);
    }
  };

  const updateFeature = (feature, otherFeatures) => {
    feature.label = label;
    feature.name = name;
    if (type === 'other') {
      if (validateAndSetNewType(otherType)) {
        feature.type = otherType;
        //let index = projectFeatures[projectFeatures.length - 1].id + 1;
        let name = otherType;
        let projectFeaturesCopy = JSON.parse(JSON.stringify(projectFeatures));
        projectFeaturesCopy.push(name);
        dispatch(addedCustomFeatureTypes(projectFeaturesCopy));
      }
      else return false;
    }
    else feature.type = type;
    feature.description = description;
    otherFeatures.push(feature);
    dispatch(editedSpotProperties({field: 'other_features', value: otherFeatures}));
    return true;
  };

  const validateAndSetNewType = (newType) => {
    let existingCustomFeatureTypes = customFeatureTypes.filter((feature) => feature === newType);
    if (!isEmpty(existingCustomFeatureTypes)) {
      Alert.alert('Alert!',
        'The type ' + newType + ' is already being used. Choose a different type name.');
      setOtherType('');
      return false;
    }
    else if (isEmpty(otherType)) {
      Alert.alert('Alert!',
        'The new type being defined is empty');
      return false;
    }
    else return true;
  };

  const renderForm = () => {
    // Validate the feature
    const validateFeature = (values) => {
      let errors = {};
      if (values.name === '') errors.name = 'Feature name cannot be empty';
      return errors;
    };

    const initialFeatureValues = {
      label: selectedFeature.label ? selectedFeature.label : '',
      name: selectedFeature.name ? selectedFeature.name : '',
      type: selectedFeature.type ? selectedFeature.type : '',
      description: selectedFeature.description ? selectedFeature.description : '',
    };

    return (
      <View style={{flex: 1}}>
        <Formik
          initialValues={initialFeatureValues}
          onSubmit={onSubmitForm}
          validate={validateFeature}
          innerRef={formRef}
          validateOnChange={true}
          enableReinitialize={true}
        >
          {() => (
            <View>
              <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                <ListItem.Content>
                  <Field
                    component={TextInputField}
                    name={'label'}
                    label={'Label'}
                    key={'label'}
                  />
                </ListItem.Content>
              </ListItem>
              <FlatListItemSeparator/>
              <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                <ListItem.Content>
                  <Field
                    component={TextInputField}
                    name={'name'}
                    label={'Name'}
                    key={'name'}
                  />
                </ListItem.Content>
              </ListItem>
              <FlatListItemSeparator/>
              <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                <ListItem.Content>
                  <Field
                    component={(formProps) => (
                      SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
                    )}
                    name={'type'}
                    key={'type'}
                    label={'Feature Type'}
                    choices={props.featureTypes.map(featureType => ({label: featureType, value: featureType}))}
                    single={true}
                  />
                </ListItem.Content>
              </ListItem>
              <FlatListItemSeparator/>
              {isOtherType() && (
                <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                  <ListItem.Title style={formStyles.fieldLabel}>{'Other Feature Type'}</ListItem.Title>
                  <ListItem.Content>
                    <TextInput
                      style={[formStyles.fieldValue, formStyles.fieldValue]}
                      placeholder={'Type of feature ...'}
                      onChangeText={newType => setOtherType(newType)}
                      value={otherType}
                    />
                  </ListItem.Content>
                </ListItem>
              )}
              {isOtherType() && <FlatListItemSeparator/>}
              <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                <ListItem.Content>
                  <Field
                    component={TextInputField}
                    name={'description'}
                    label={'Feature Description'}
                    key={'description'}
                  />
                </ListItem.Content>
              </ListItem>
              {!isEmpty(props.selectedFeature.name) && (
                <Button
                  titleStyle={{color: themes.RED}}
                  title={'Delete Feature'}
                  type={'clear'}
                  onPress={() => deleteFeatureConfirm()}
                />
              )}
            </View>
          )}
        </Formik>
      </View>
    );
  };

  return (
    <React.Fragment>
      <React.Fragment>
        <SaveAndCloseButton
          cancel={() => cancelForm()}
          save={() => saveForm(formRef.current)}
        />
        <FlatList ListHeaderComponent={renderForm()}/>
      </React.Fragment>
    </React.Fragment>
  );
};

export default OtherFeatureDetail;