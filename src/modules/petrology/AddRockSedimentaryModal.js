import React from 'react';

import {Form, FormSlider, MainButtons} from '../form';

const AddRockSedimentaryModal = ({choices, formName, formProps, setChoicesViewKey, survey}) => {
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
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  return (
    <>
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={firstKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      {formProps.values.primary_lithology === 'siliciclastic' && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={siliciclasticKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      {(formProps.values.primary_lithology === 'limestone' || formProps.values.primary_lithology === 'dolostone') && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={dunhamKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      {formProps.values.primary_lithology === 'evaporite' && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={evaporiteKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      {formProps.values.primary_lithology === 'organic_coal' && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={organicCoalKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      {formProps.values.primary_lithology === 'volcaniclastic' && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={volcaniclasticKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      {formProps.values.primary_lithology === 'phosphatic' && (
        <MainButtons
          formName={formName}
          formProps={formProps}
          mainKeys={phosphoriteKeys}
          setChoicesViewKey={setChoicesViewKey}
        />
      )}
      <FormSlider
        choices={choices}
        fieldKey={weatheringKey}
        formProps={formProps}
        hasNoneChoice={true}
        hasRotatedLabels={true}
        isHideLabels={true}
        showSliderValue={true}
        survey={survey}
      />
      <MainButtons
        formName={formName}
        formProps={formProps}
        mainKeys={thirdKeys}
        setChoicesViewKey={setChoicesViewKey}
      />
      <Form {...{surveyFragment: lastKeysFields, ...formProps}}/>
    </>
  );
};

export default AddRockSedimentaryModal;
