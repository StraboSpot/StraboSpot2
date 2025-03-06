import React from 'react';

import {Form, MainButtons} from '../form';

const AddRockFaultModal = ({formName, formProps, setChoicesViewKey, survey}) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['fault_rock'];
  const lastKeys = ['interp_note'];

  // Relevant fields for quick-entry modal
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={firstKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...formProps}}/>
    </>
  );
};

export default AddRockFaultModal;
