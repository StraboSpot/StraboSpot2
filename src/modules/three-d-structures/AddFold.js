import React, {useState} from 'react';

import {FoldGeometryButtons} from './fold-geometry';
import {FOLD_MEASUREMENTS_KEYS} from './threeDStructures.constants';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, FormSlider, MainButtons, useForm} from '../form';
import MeasurementButtons from '../form/MeasurementButtons';
import MeasurementModal from '../form/MeasurementModal';

const AddFold = (props) => {
  const {getSurvey} = useForm();

  const [isFoldMeasurementsModalVisible, setIsFoldMeasurementsModalVisible] = useState(false);
  const [foldMeasurementsGroupField, setFoldMeasurementsGroupField] = useState({});

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = ['feature_type'];
  const tightnessKey = 'tightness';
  const vergenceKey = 'vergence';
  const lastKeys = ['fold_notes'];

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
        measurementsKeys={FOLD_MEASUREMENTS_KEYS}
        setMeasurementsGroupField={setFoldMeasurementsGroupField}
        setIsMeasurementsModalVisible={setIsFoldMeasurementsModalVisible}
        survey={survey}
      />
      <FoldGeometryButtons {...props}/>
      <FormSlider
        fieldKey={tightnessKey}
        hasNoneChoice={true}
        hasRotatedLabels={true}
        isHideLabels={true}
        showSliderValue={true}
        {...props}
      />
      <FormSlider {...{fieldKey: vergenceKey, hasNoneChoice: true, hasRotatedLabels: true, ...props}}/>
      <LittleSpacer/>
      <Form {...{formName: props.formName, surveyFragment: lastKeysFields, ...props.formProps}}/>
      {isFoldMeasurementsModalVisible && (
        <MeasurementModal
          measurementsGroup={FOLD_MEASUREMENTS_KEYS[foldMeasurementsGroupField.name]}
          measurementsGroupLabel={foldMeasurementsGroupField.label}
          formName={props.formName}
          formProps={props.formProps}
          setIsMeasurementModalVisible={setIsFoldMeasurementsModalVisible}
        />
      )}
    </>
  );
};

export default AddFold;
