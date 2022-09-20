import React from 'react';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, FormSlider, MainButtons, useFormHook} from '../form';
import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';

const FaultRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = FIRST_ORDER_FABRIC_FIELDS.fault_rock;
  const lastKeys = ['interp_note'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      <LittleSpacer/>
      <FormSlider {...{fieldKey: tectoniteTypesKey, hasNoneChoice: true, hasRotatedLabels: true, ...props}}/>
    </React.Fragment>
  );
};

export default FaultRockFabric;
