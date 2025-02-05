import React from 'react';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons} from '../form';

const AddLine = ({formName, formProps, isManualMeasurement, isPlanarLinear, setChoicesViewKey, survey}) => {

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = ['feature_type'];
  const lastKeys = ['defined_by', 'notes'];

  // Relevant fields for quick-entry modal
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  let updatedFormProps = {...formProps};
  if (isPlanarLinear) {
    updatedFormProps = {
      ...formProps,
      values: (formProps.values.associated_orientation && formProps.values.associated_orientation[0]) || {},
    };
  }

  return (
    <>
      {!isManualMeasurement && !isPlanarLinear && (
        <Form {...{formName: formName, surveyFragment: firstKeysFields, ...updatedFormProps}}/>
      )}
      <MainButtons
        formName={formName}
        formProps={updatedFormProps}
        mainKeys={mainButtonsKeys}
        setChoicesViewKey={setChoicesViewKey}
        subkey={isPlanarLinear && 'associated_orientation'}
      />
      <LittleSpacer/>
      <Form {...{
        formName: formName,
        surveyFragment: lastKeysFields,
        subkey: isPlanarLinear && 'associated_orientation',
        ...updatedFormProps,
      }}/>
    </>
  );
};

export default AddLine;
