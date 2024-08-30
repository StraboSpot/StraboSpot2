import React from 'react';

import {Form, FormSlider, MainButtons} from '../form';

const AddRockSedimentaryModal = (props) => {
  // Relevant keys for quick-entry modal
  const firstKeys = ['primary_lithology'];
  const siliciclasticKeys = ['siliciclastic_type'];
  const dunhamKeys = ['dunham_classification', 'grain_type'];
  const evaporiteKeys = ['evaporite_type'];
  const organicCoalKeys = ['organic_coal_lithologies'];
  const volcaniclasticKeys = ['volcaniclastic_type'];
  const phosphoriteKeys = ['phosphorite_type'];
  const weatheringKey = 'relative_resistance_weather';
  const thirdKeys = ['lithification', 'color_appearance'];
  const lastKeys = ['fresh_color', 'weathered_color', 'notes'];

  // Relevant fields for quick-entry modal
  const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k));

  return (
    <>
      <MainButtons
        mainKeys={firstKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      {props.formProps.values.primary_lithology === 'siliciclastic' && (
        <MainButtons
          mainKeys={siliciclasticKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      {(props.formProps.values.primary_lithology === 'limestone'
        || props.formProps.values.primary_lithology === 'dolostone') && (
        <MainButtons
          mainKeys={dunhamKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      {props.formProps.values.primary_lithology === 'evaporite' && (
        <MainButtons
          mainKeys={evaporiteKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      {props.formProps.values.primary_lithology === 'organic_coal' && (
        <MainButtons
          mainKeys={organicCoalKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      {props.formProps.values.primary_lithology === 'volcaniclastic' && (
        <MainButtons
          mainKeys={volcaniclasticKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      {props.formProps.values.primary_lithology === 'phosphatic' && (
        <MainButtons
          mainKeys={phosphoriteKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
      )}
      <FormSlider {...{
        fieldKey: weatheringKey,
        hasNoneChoice: true,
        hasRotatedLabels: true,
        isHideLabels: true,
        showSliderValue: true,
        ...props,
      }}/>
      <MainButtons
        mainKeys={thirdKeys}
        formName={props.formName}
        formProps={props.formProps}
        setChoicesViewKey={props.setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...props.formProps}}/>
    </>
  );
};

export default AddRockSedimentaryModal;
