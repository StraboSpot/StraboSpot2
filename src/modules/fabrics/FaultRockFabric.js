import React from 'react';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, FormSlider, MainButtons, useForm} from '../form';

const FaultRockFabric = (props) => {
  const {getSurvey} = useForm();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = FIRST_ORDER_FABRIC_FIELDS.fault_rock;
  const lastKeys = ['interp_note'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const survey = getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <MainButtons {...{mainKeys: mainButtonsKeys, ...props}}/>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <FormSlider {...{fieldKey: tectoniteTypesKey, hasNoneChoice: true, hasRotatedLabels: true, ...props}}/>
    </>
  );
};

export default FaultRockFabric;
