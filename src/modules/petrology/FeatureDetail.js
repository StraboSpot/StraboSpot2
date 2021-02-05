import React, {useRef, useState} from 'react';
import {Alert, ScrollView, TextInput, View} from 'react-native';

import {Field, Formik} from 'formik';
import {Button, ListItem} from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {formStyles, TextInputField, useFormHook} from '../form';
import {DEFAULT_GEOLOGIC_TYPES} from '../project/project.constants';
import {addedCustomFeatureTypes} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const FeatureDetail = (props) => {
  const dispatch = useDispatch();
  const [useForm] = useFormHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const projectFeatures = useSelector(state => state.project.project.other_features);

  const selectedFeature = props.selectedFeature;
  const customFeatureTypes = projectFeatures.filter(feature => !DEFAULT_GEOLOGIC_TYPES.includes(feature.name));
  let label = useState(selectedFeature.label === undefined ? '' : selectedFeature.label);
  let name = useState(selectedFeature.name === undefined ? '' : selectedFeature.name);
  const [typeEnum, setTypeEnum] = useState('');
  let [type, setType]
    = useState(selectedFeature.type === undefined ? '' : selectedFeature.type);
  let [otherType, setOtherType] = useState('');
  let description = useState(selectedFeature.description === undefined ? '' : selectedFeature.description);
  const featureForm = useRef(null);

  const cancelForm = async () => {
    props.hideFeatureDetail();
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

  const fieldValueChanged = (value) => {
    setTypeEnum(value[0]);
    let types = props.featureTypes.filter(eachFeature => eachFeature.id === value[0]);
    setType(types[0].name);
  };

  const onSubmitForm = () => {
    // No op
  };

  const saveForm = async () => {
    if (useForm.hasErrors(featureForm.current)) {
      useForm.showErrors(featureForm.current);
      return Promise.reject();
    }
    let featureToEdit;
    await featureForm.current.submitForm();
    let otherFeatures = spot.properties.other_features;
    if (!featureForm.current.values.label) label = featureForm.current.values.name;
    else label = featureForm.current.values.label;
    name = featureForm.current.values.name;
    description = featureForm.current.values.description;
    if (!type) type = 'geomorphic'; // defaults type to geomorphic, if not selected.
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
    if (updateFeature(featureToEdit, otherFeatures)) props.hideFeatureDetail();
  };

  const updateFeature = (feature, otherFeatures) => {
    feature.label = label;
    feature.name = name;
    if (type === 'other') {
      if (validateAndSetNewType(otherType)) {
        feature.type = otherType;
        let index = projectFeatures[projectFeatures.length - 1].id + 1;
        let name = otherType;
        let projectFeaturesCopy = JSON.parse(JSON.stringify(projectFeatures));
        projectFeaturesCopy.push({'id': index, 'name': name});
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
    let existingCustomFeatureTypes = customFeatureTypes.filter((feature) => feature.name === newType);
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

  const renderFeatureForm = () => {

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
          innerRef={featureForm}
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
                    component={TextInputField}
                    name={'description'}
                    label={'Feature Description'}
                    key={'description'}
                  />
                </ListItem.Content>
              </ListItem>
              <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                <ListItem.Title style={formStyles.fieldLabel}>{'Feature Type'}</ListItem.Title>
              </ListItem>
              <MultiSelect
                label={'Type'}
                hideSubmitButton={true}
                hideTags={false}
                single={true}
                styleMainWrapper={formStyles.dropdownSelectedContainer}
                items={props.featureTypes}
                uniqueKey={'id'}
                displayKey={'name'}
                selectedItems={typeEnum}
                selectText={type === '' ? '--Select Feature Type--' : '   ' + type}
                onSelectedItemsChange={fieldValueChanged}
                fontSize={themes.PRIMARY_TEXT_SIZE}
                selectedItemTextColor={themes.BLACK}
                selectedItemIconColor={themes.BLACK}
                textColor={themes.BLACK}
                itemTextColor={themes.BLACK}
                styleRowList={formStyles.fieldValue}
                styleDropdownMenuSubsection={formStyles.dropdownSelectedContainer}
              />
              <FlatListItemSeparator/>
              {type === 'other' && <ListItem containerStyle={commonStyles.listItemMinimalVerticalPadding}>
                {type === 'other'
                && <ListItem.Title style={formStyles.fieldLabel}>{'Other Feature Type'}</ListItem.Title>}
                <ListItem.Content>
                  {type === 'other' && (<TextInput
                    style={[formStyles.fieldValue, formStyles.fieldValue]}
                    placeholder={'Type of feature ...'}
                    onChangeText={name => setOtherType(name)}
                    value={otherType}
                  />)}
                </ListItem.Content>
              </ListItem>}
              {type === 'other' && <FlatListItemSeparator/>}
              {name !== '' && (<Button
                titleStyle={{color: themes.RED}}
                title={'Delete Feature'}
                type={'clear'}
                onPress={() => deleteFeatureConfirm()}
              />)}
            </View>
          )}
        </Formik>
      </View>
    );
  };

  return (
    <React.Fragment>
      <SaveAndCloseButton
        cancel={() => cancelForm()}
        save={() => saveForm()}
      />
      <ScrollView>
        {renderFeatureForm()}
      </ScrollView>
    </React.Fragment>
  );
};

export default FeatureDetail;
