import React from 'react';

import {isEmpty} from '../../shared/Helpers';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {BoolButton, ChoiceButtons, Form, FormSlider, MainButtons, useFormHook} from '../form';
import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';

const FaultRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = FIRST_ORDER_FABRIC_FIELDS.fault_rock;
  const spatialConfigKey = 'spatial_config';
  const spatialConfigDescriptionKey = 'desc_spat_char';
  const kinIndPresentKey = 'kin_ind_present';
  const lastKeys = ['interp_note'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const spatialConfigDescriptionField = survey.find(f => f.name === spatialConfigDescriptionKey);
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  const onSpatialConfigSelected = (choiceName) => {
    const spatialConfigValues = props.formProps.values[spatialConfigKey] || [];
    if (spatialConfigValues.includes(choiceName)) {
      const spatialConfigValuesFiltered = spatialConfigValues.filter(n => n !== choiceName);
      props.formProps.setFieldValue(spatialConfigKey, spatialConfigValuesFiltered);
    }
    else props.formProps.setFieldValue(spatialConfigKey, [...spatialConfigValues, choiceName]);
  };

  const onKinIndPresentSelected = () => {
    const kinIndPresentValue = props.formProps.values[kinIndPresentKey];
    if (kinIndPresentValue !== 'yes_kin') props.formProps.setFieldValue(kinIndPresentKey, 'yes_kin');
    props.setChoicesViewKey(kinIndPresentKey);
  };

  return (
    <React.Fragment>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <LittleSpacer/>
      <ChoiceButtons {...{
        choiceFieldKey: spatialConfigKey,
        size: 'small',
        onPress: onSpatialConfigSelected,
        ...props,
      }}/>
      {!isEmpty(props.formProps.values[spatialConfigKey]) && (
        <Form {...{formName: props.formName, surveyFragment: [spatialConfigDescriptionField], ...props.formProps}}/>
      )}
      <LittleSpacer/>
      <BoolButton {...{
        fieldKey: [kinIndPresentKey],
        selectedKey: 'yes_kin',
        onPress: onKinIndPresentSelected,
        ...props,
      }}
      />
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <FormSlider {...{fieldKey: tectoniteTypesKey, hasNoneChoice: true, hasRotatedLabels: true, ...props}}/>
    </React.Fragment>
  );
};

export default FaultRockFabric;
