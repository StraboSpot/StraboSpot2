import React from 'react';

import {isEmpty} from '../../shared/Helpers';
import {Form, useFormHook} from '../form';
import BoolButton from '../form/BoolButton';
import ChoiceButtons from '../form/ChoiceButtons';
import FormSlider from '../form/FormSlider';
import MainButtons from '../form/MainButtons';

const FaultRockFabric = (props) => {
  const [useForm] = useFormHook();

  // Relevant keys for quick-entry modal
  const firstKeys = ['label'];
  const mainButttonsKeys = ['inco_nofol', 'inco_fol', 'co_nofol', 'co_fol'];
  const spatialConfigKey = 'spatial_config';
  const spatialConfigDescriptionKey = 'desc_spat_char';
  const kinIndPresentKey = 'kin_ind_present';
  const lastKeys = ['interp_note'];
  const tectoniteTypesKey = 'tectonite_type';

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(props.formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const spatialConfigDescriptionField = props.survey.find(f => f.name === spatialConfigDescriptionKey);
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  const onSpatialConfigSelected = (choiceName) => {
    const spatialConfigValues = props.formRef.current?.values[spatialConfigKey] || [];
    if (spatialConfigValues.includes(choiceName)) {
      const spatialConfigValuesFiltered = spatialConfigValues.filter(n => n !== choiceName);
      props.formRef.current?.setFieldValue(spatialConfigKey, spatialConfigValuesFiltered);
    }
    else props.formRef.current?.setFieldValue(spatialConfigKey, [...spatialConfigValues, choiceName]);
  };

  const onKinIndPresentSelected = () => {
    const kinIndPresentValue = props.formRef.current?.values[kinIndPresentKey];
    if (kinIndPresentValue !== 'yes_kin') props.formRef.current?.setFieldValue(kinIndPresentKey, 'yes_kin');
    props.setChoicesViewKey(kinIndPresentKey);
  };

  return (
    <React.Fragment>
      <Form {...{
        formName: props.formName,
        surveyFragment: firstKeysFields,
        ...props.formProps,
      }}
      />
      <MainButtons {...{mainKeys: mainButttonsKeys, ...props}}/>
      <ChoiceButtons {...{
        choiceFieldKey: spatialConfigKey,
        onPress: onSpatialConfigSelected,
        ...props,
      }}/>
      {!isEmpty(props.formRef.current?.values[spatialConfigKey]) && (
        <Form {...{
          formName: props.formName,
          surveyFragment: [spatialConfigDescriptionField],
          ...props.formProps,
        }}/>
      )}
      <BoolButton {...{
        fieldKey: [kinIndPresentKey],
        selectedKey: 'yes_kin',
        onPress: onKinIndPresentSelected,
        ...props,
      }}
      />
      <Form {...{
        formName: props.formName,
        surveyFragment: lastKeysFields,
        ...props.formProps,
      }}
      />
      <FormSlider {...{
        fieldKey: tectoniteTypesKey,
        ...props,
      }}
      />
    </React.Fragment>
  );
};

export default FaultRockFabric;
