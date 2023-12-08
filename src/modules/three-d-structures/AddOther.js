import React, {useState} from 'react';

import {
  BOUDINAGE_MEASUREMENTS_KEYS,
  MULLION_MEASUREMENTS_KEYS,
  ThreeDStructuresMeasurementsButtons,
  ThreeDStructuresMeasurementsModal,
} from './measurements';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import {Form, MainButtons} from '../form';

const AddOther = (props) => {
  const [isOtherMeasurementsModalVisible, setIsOtherMeasurementsModalVisible] = useState(false);
  const [otherMeasurementsGroupField, setOtherMeasurementsGroupField] = useState({});

  // Relevant keys for quick-entry modal
  const labelKey = ['label'];
  const firstKeys = ['feature_type'];
  const boudinageFirstKeys = ['boudinage_geometry', 'boudinage_shape'];
  const boudinageThirdKeys = ['boudinage_competent', 'boudinage_incompetent', 'average_width_of_boudin_neck',
    'number_of_necks_measured', 'boudinage_wavelength_m', 'boudinaged_layer_thickness_m'];
  const mullionFirstKeys = ['mullion_geometry', 'mullion_symmetry'];
  const mullionThirdKeys = ['mullion_competent_material', 'mullion_incompetent_material', 'mullion_wavelength_m',
    'mullion_layer_thickness_m'];
  const lobateCuspateKeys = ['approximate_scale_m_lobate', 'lobate_competent_material', 'lobate_incompetent_material'];
  const lastKeys = ['struct_notes'];

  // Relevant fields for quick-entry modal
  const labelField = labelKey.map(k => props.survey.find(f => f.name === k));
  const boudinageKeysFields = boudinageThirdKeys.map(k => props.survey.find(f => f.name === k));
  const mullionKeysFields = mullionThirdKeys.map(k => props.survey.find(f => f.name === k));
  const lobateCuspateKeysFields = lobateCuspateKeys.map(k => props.survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k));

  return (
    <React.Fragment>
      <Form {...{surveyFragment: labelField, ...props.formProps}}/>
      <MainButtons
        mainKeys={firstKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      {props.formProps.values.feature_type === 'boudinage' && (
        <React.Fragment>
          <MainButtons
            mainKeys={boudinageFirstKeys}
            formName={props.formName}
            formProps={props.formProps}
            setChoicesViewKey={props.setChoicesViewKey}
          />
          <ThreeDStructuresMeasurementsButtons
            formProps={props.formProps}
            measurementsKeys={BOUDINAGE_MEASUREMENTS_KEYS}
            setMeasurementsGroupField={setOtherMeasurementsGroupField}
            setIsMeasurementsModalVisible={setIsOtherMeasurementsModalVisible}
            survey={props.survey}
          />
          <Form {...{surveyFragment: boudinageKeysFields, ...props.formProps}}/>
          {isOtherMeasurementsModalVisible && (
            <ThreeDStructuresMeasurementsModal
              measurementsGroup={BOUDINAGE_MEASUREMENTS_KEYS[otherMeasurementsGroupField.name]}
              measurementsGroupLabel={otherMeasurementsGroupField.label}
              formName={props.formName}
              formProps={props.formProps}
              setIsThreeDStructuresMeasurementsModalVisible={setIsOtherMeasurementsModalVisible}
            />
          )}
        </React.Fragment>
      )}
      {props.formProps.values.feature_type === 'mullion' && (
        <React.Fragment>
          <MainButtons
            mainKeys={mullionFirstKeys}
            formName={props.formName}
            formProps={props.formProps}
            setChoicesViewKey={props.setChoicesViewKey}
          />
          <ThreeDStructuresMeasurementsButtons
            formProps={props.formProps}
            measurementsKeys={MULLION_MEASUREMENTS_KEYS}
            setMeasurementsGroupField={setOtherMeasurementsGroupField}
            setIsMeasurementsModalVisible={setIsOtherMeasurementsModalVisible}
            survey={props.survey}
          />
          <Form {...{surveyFragment: mullionKeysFields, ...props.formProps}}/>
          {isOtherMeasurementsModalVisible && (
            <ThreeDStructuresMeasurementsModal
              measurementsGroup={MULLION_MEASUREMENTS_KEYS[otherMeasurementsGroupField.name]}
              measurementsGroupLabel={otherMeasurementsGroupField.label}
              formName={props.formName}
              formProps={props.formProps}
              setIsThreeDStructuresMeasurementsModalVisible={setIsOtherMeasurementsModalVisible}
            />
          )}
        </React.Fragment>
      )}
      {props.formProps.values.feature_type === 'lobate_cuspate' && (
        <Form {...{surveyFragment: lobateCuspateKeysFields, ...props.formProps}}/>
      )}
      <LittleSpacer/>
      <Form {...{surveyFragment: lastKeysFields, ...props.formProps}}/>
    </React.Fragment>
  );
};

export default AddOther;
