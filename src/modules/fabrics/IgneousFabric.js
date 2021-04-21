import React from 'react';

import {Form, useFormHook} from '../form';
import MainButtons from '../form/MainButtons';

const FaultRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = ['planar_fab', 'lin_fab', 'magmatic_str', 'solid_state_str'];
  const lastKeys = ['mag_interp_note'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <Form {...{
        formName: props.formName,
        surveyFragment: firstKeysFields,
        ...props.formProps,
      }}/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <Form {...{
        formName: props.formName,
        surveyFragment: lastKeysFields,
        ...props.formProps,
      }}/>
    </React.Fragment>
  );
};

export default FaultRockFabric;
