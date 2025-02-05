import React, {useState} from 'react';

import {FoldGeometryButtons} from './fold-geometry';
import {FOLD_MEASUREMENTS_KEYS} from './threeDStructures.constants';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, FormSlider, MainButtons} from '../form';
import MeasurementButtons from '../form/MeasurementButtons';
import MeasurementModal from '../form/MeasurementModal';

const AddFold = ({choices, formName, formProps, setChoicesViewKey, survey}) => {

  const [isFoldMeasurementsModalVisible, setIsFoldMeasurementsModalVisible] = useState(false);
  const [foldMeasurementsGroupField, setFoldMeasurementsGroupField] = useState({});

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButtonsKeys = ['feature_type'];
  const tightnessKey = 'tightness';
  const vergenceKey = 'vergence';
  const lastKeys = ['fold_notes'];

  // Relevant fields for quick-entry modal
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <Form {...{formName: formName, surveyFragment: firstKeysFields, ...formProps}}/>
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={mainButtonsKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      <MeasurementButtons
        formProps={formProps}
        measurementsKeys={FOLD_MEASUREMENTS_KEYS}
        setIsMeasurementsModalVisible={setIsFoldMeasurementsModalVisible}
        setMeasurementsGroupField={setFoldMeasurementsGroupField}
        survey={survey}
      />
      <FoldGeometryButtons
        formProps={formProps}
        setChoicesViewKey={setChoicesViewKey}
      />
      <FormSlider
        choices={choices}
        fieldKey={tightnessKey}
        formProps={formProps}
        hasNoneChoice={true}
        hasRotatedLabels={true}
        isHideLabels={true}
        showSliderValue={true}
        survey={survey}
      />
      <FormSlider
        choices={choices}
        fieldKey={vergenceKey}
        formProps={formProps}
        hasNoneChoice={true}
        hasRotatedLabels={true}
        survey={survey}
      />
      <LittleSpacer/>
      <Form {...{formName: formName, surveyFragment: lastKeysFields, ...formProps}}/>
      {isFoldMeasurementsModalVisible && (
        <MeasurementModal
          formName={formName}
          formProps={formProps}
          measurementsGroup={FOLD_MEASUREMENTS_KEYS[foldMeasurementsGroupField.name]}
          measurementsGroupLabel={foldMeasurementsGroupField.label}
          setIsMeasurementModalVisible={setIsFoldMeasurementsModalVisible}
        />
      )}
    </>
  );
};

export default AddFold;
