import React, {useState} from 'react';

import {FAULT_MEASUREMENTS_KEYS} from './threeDStructures.constants';
import {Form, MainButtons, useForm} from '../form';
import MeasurementButtons from '../form/MeasurementButtons';
import MeasurementModal from '../form/MeasurementModal';

const AddFault = (props) => {
  const {getSurvey} = useForm();

  const [isFaultMeasurementsModalVisible, setIsFaultMeasurementsModalVisible] = useState(false);
  const [faultMeasurementsGroupField, setFaultMeasurementsGroupField] = useState({});

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = ['fault_or_sz_type'];
  const secondButtonKeys = ['movement', 'movement_justification', 'directional_indicators'];
  const lastKeys = ['movement_amount_m', 'amplitude_m', 'folded_layer_thickness_m', 'fault_notes'];

  // Relevant fields for quick-entry modal
  const survey = getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <MainButtons {...{mainKeys: mainButtonsKeys, ...props}}/>
      <MeasurementButtons
        formProps={props.formProps}
        measurementsKeys={FAULT_MEASUREMENTS_KEYS}
        setMeasurementsGroupField={setFaultMeasurementsGroupField}
        setIsMeasurementsModalVisible={setIsFaultMeasurementsModalVisible}
        survey={survey}
      />
      <MainButtons {...{mainKeys: secondButtonKeys, ...props}}/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      {isFaultMeasurementsModalVisible && (
        <MeasurementModal
          measurementsGroup={FAULT_MEASUREMENTS_KEYS[faultMeasurementsGroupField.name]}
          measurementsGroupLabel={faultMeasurementsGroupField.label}
          formName={props.formName}
          formProps={props.formProps}
          setIsMeasurementModalVisible={setIsFaultMeasurementsModalVisible}
        />
      )}
    </>
  );
};

export default AddFault;
