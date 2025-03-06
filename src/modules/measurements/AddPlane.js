import React from 'react';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons} from '../form';

const AddPlane = ({formName, formProps, isManualMeasurement, setChoicesViewKey, survey}) => {

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = ['feature_type'];
  const beddingButtonsKeys = ['bedding_type'];
  const contactButtonsKeys = ['contact_type'];
  const foliationButtonsKeys = ['foliation_type', 'directional_indicators'];
  const fractureButtonsKeys = ['fracture_type', 'directional_indicators'];
  const veinButtonsKeys = ['vein_type'];
  const faultButtonsKeys = ['fault_or_sz_type', 'directional_indicators'];
  const lastKeys = ['thickness', 'length', 'notes'];

  // Relevant fields for quick-entry modal
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  const featureType = formProps?.values?.feature_type;
  const featureTypeSubKeys = featureType === 'bedding' ? beddingButtonsKeys
    : featureType === 'contact' ? contactButtonsKeys
      : featureType === 'foliation' ? foliationButtonsKeys
        : featureType === 'fracture' ? fractureButtonsKeys
          : featureType === 'vein' ? veinButtonsKeys
            : featureType === 'fault' || featureType === 'shear_zone_bou' || featureType === 'shear_zone' ? faultButtonsKeys
              : undefined;

  return (
    <>
      {!isManualMeasurement && (
        <Form {...{formName: formName, surveyFragment: firstKeysFields, ...formProps}}/>
      )}
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={mainButtonsKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      {featureTypeSubKeys && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={featureTypeSubKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      <LittleSpacer/>
      <Form {...{formName: formName, surveyFragment: lastKeysFields, ...formProps}}/>
    </>
  );
};

export default AddPlane;
