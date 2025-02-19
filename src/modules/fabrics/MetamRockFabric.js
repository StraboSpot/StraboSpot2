import React from 'react';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import {Form, FormSlider, MainButtons} from '../form';

const MetamRockFabric = ({choices, formName, formProps, setChoicesViewKey, survey}) => {

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = FIRST_ORDER_FABRIC_FIELDS.metamorphic_rock;
  const lastKeys = ['interp_note_meta'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: formName, surveyFragment: firstKeysFields, ...formProps}}/>
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={mainButtonsKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      <Form {...{formName: formName, surveyFragment: lastKeysFields, ...formProps}}/>
      <FormSlider
        choices={choices}
        fieldKey={tectoniteTypesKey}
        formProps={formProps}
        hasNoneChoice={true}
        hasRotatedLabels={true}
        survey={survey}
      />
    </>
  );
};

export default MetamRockFabric;
