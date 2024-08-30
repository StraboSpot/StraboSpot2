import React from 'react';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import {Form, MainButtons, useFormHook} from '../form';

const IgneousRockFabric = (props) => {
  const useForm = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = FIRST_ORDER_FABRIC_FIELDS.igneous_rock;
  const lastKeys = ['mag_interp_note'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <MainButtons {...{mainKeys: mainButtonsKeys, ...props}}/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
    </>
  );
};

export default IgneousRockFabric;
