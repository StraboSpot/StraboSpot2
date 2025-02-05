import React from 'react';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import {Form, MainButtons} from '../form';

const IgneousRockFabric = ({formName, formProps, setChoicesViewKey, survey}) => {

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = FIRST_ORDER_FABRIC_FIELDS.igneous_rock;
  const lastKeys = ['mag_interp_note'];

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
    </>
  );
};

export default IgneousRockFabric;
