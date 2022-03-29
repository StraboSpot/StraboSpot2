import React from 'react';

import {Form, MainButtons} from '../form';

const AddRockFaultModal = (props) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['fault_rock'];
  const lastKeys = ['interp_note'];

  // Relevant fields for quick-entry modal
  const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <MainButtons
        mainKeys={firstKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...props.formProps}}/>
    </React.Fragment>
  );
};

export default AddRockFaultModal;
