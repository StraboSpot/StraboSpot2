import React from 'react';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import {Form, FormSlider, MainButtons, useForm} from '../form';

const MetamRockFabric = (props) => {
  const {getSurvey} = useForm();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = FIRST_ORDER_FABRIC_FIELDS.metamorphic_rock;
  const lastKeys = ['interp_note_meta'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const survey = getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <MainButtons {...{mainKeys: mainButtonsKeys, ...props}}/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      <FormSlider {...{fieldKey: tectoniteTypesKey, hasNoneChoice: true, hasRotatedLabels: true, ...props}}/>
    </>
  );
};

export default MetamRockFabric;
