import React, {useState} from 'react';

import {FoldGeometryButtons} from './fold-geometry';
import {
  FOLD_MEASUREMENTS_KEYS,
  ThreeDStructuresMeasurementsButtons,
  ThreeDStructuresMeasurementsModal,
} from './measurements';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, FormSlider, MainButtons, useFormHook} from '../form';

const AddFold = (props) => {
  const useForm = useFormHook();

  const [isFoldMeasurementsModalVisible, setIsFoldMeasurementsModalVisible] = useState(false);
  const [foldMeasurementsGroupField, setFoldMeasurementsGroupField] = useState({});

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = ['feature_type'];
  const tightnessKey = 'tightness';
  const vergenceKey = 'vergence';
  const lastKeys = ['fold_notes'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <Form {...{formName: props.formName, surveyFragment: firstKeysFields, ...props.formProps}}/>
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <ThreeDStructuresMeasurementsButtons
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
        <ThreeDStructuresMeasurementsModal
          measurementsGroup={FOLD_MEASUREMENTS_KEYS[foldMeasurementsGroupField.name]}
          measurementsGroupLabel={foldMeasurementsGroupField.label}
          formName={props.formName}
          formProps={props.formProps}
          setIsThreeDStructuresMeasurementsModalVisible={setIsFoldMeasurementsModalVisible}
        />
      )}
    </React.Fragment>
  );
};

export default AddFold;
