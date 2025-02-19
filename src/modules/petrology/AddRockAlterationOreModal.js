import React from 'react';

import {Form, MainButtons} from '../form';

const AddRockAlterationOreModal = ({formName, formProps, setChoicesViewKey, survey}) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['ore_type'];
  const secondKeys = ['hydrothermal_alteration'];
  const lastKeys = ['alteration_host_rock', 'mineralized_elements', 'notes_ore'];

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
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={secondKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...formProps}}/>
    </>
  );
};

export default AddRockAlterationOreModal;
