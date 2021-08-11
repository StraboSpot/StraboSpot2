import React from 'react';

import {Form, MainButtons} from '../form';

const AddRockAlterationOreModal = (props) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['ore_type'];
  const secondKeys = ['hydrothermal_alteration'];
  const lastKeys = ['alteration_host_rock', 'mineralized_elements', 'notes_ore'];

  // Relevant fields for quick-entry modal
  const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <MainButtons {...{
        mainKeys: firstKeys,
        formName: props.formName,
        formRef: props.formRef,
        setChoicesViewKey: props.setChoicesViewKey,
      }}/>
      <MainButtons {...{
        mainKeys: secondKeys,
        formName: props.formName,
        formRef: props.formRef,
        setChoicesViewKey: props.setChoicesViewKey,
      }}/>
      <Form {...{
        surveyFragment: lastKeysFields,
        ...props.formProps,
      }}/>
    </React.Fragment>
  );
};

export default AddRockAlterationOreModal;
