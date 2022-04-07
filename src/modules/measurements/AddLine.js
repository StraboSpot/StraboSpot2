import React from 'react';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons, useFormHook} from '../form';

const AddLine = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = ['feature_type'];
  const lastKeys = ['defined_by', 'notes'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  let updatedProps = {...props};
  if (props.subkey) {
    updatedProps = {
      ...updatedProps,
      formProps: {...updatedProps.formProps, values: updatedProps.formProps.values[props.subkey] || {}},
    };
  }

  return (
    <React.Fragment>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...updatedProps.formProps}}/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...updatedProps}}/>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...updatedProps.formProps}}/>
    </React.Fragment>
  );
};

export default AddLine;
