import React from 'react';

import {Form, MainButtons} from '../form';

const AddRockMetamorphicModal = (props) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['metamorphic_rock_type'];
  const secondKeys = ['protolith'];
  const thirdKeys = ['facies'];
  const fourthKeys = ['zone'];
  const lastKeys = ['notes_metamorphic'];

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
      <MainButtons {...{
        mainKeys: thirdKeys,
        formName: props.formName,
        formRef: props.formRef,
        setChoicesViewKey: props.setChoicesViewKey,
      }}/>
      <MainButtons {...{
        mainKeys: fourthKeys,
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

export default AddRockMetamorphicModal;
