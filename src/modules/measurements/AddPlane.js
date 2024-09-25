import React from 'react';

import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons, useForm} from '../form';

const AddPlane = (props) => {
  const {getSurvey} = useForm();

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
  const survey = getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  const featureType = props.formProps?.values?.feature_type;

  return (
    <>
      {!props.isManualMeasurement && (
        <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      )}
      <MainButtons {...{mainKeys: mainButtonsKeys, ...props}}/>
      {featureType && (
        <>
          {featureType === 'bedding' && <MainButtons {...{mainKeys: beddingButtonsKeys, ...props}}/>}
          {featureType === 'contact' && <MainButtons {...{mainKeys: contactButtonsKeys, ...props}}/>}
          {featureType === 'foliation' && <MainButtons {...{mainKeys: foliationButtonsKeys, ...props}}/>}
          {featureType === 'fracture' && <MainButtons {...{mainKeys: fractureButtonsKeys, ...props}}/>}
          {featureType === 'vein' && <MainButtons {...{mainKeys: veinButtonsKeys, ...props}}/>}
          {featureType === 'fault' || featureType === 'shear_zone_bou' || featureType === 'shear_zone'
            && <MainButtons {...{mainKeys: faultButtonsKeys, ...props}}/>}
        </>
      )}
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
    </>
  );
};

export default AddPlane;
