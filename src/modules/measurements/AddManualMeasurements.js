import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import commonStyles from '../../shared/common.styles';
import Slider from '../../shared/ui/SliderBar';
import uiStyles from '../../shared/ui/ui.styles';
import compassStyles from '../compass/compass.styles';
import {Form, useFormHook} from '../form';
import {MEASUREMENT_KEYS} from './measurements.constants';

const AddManualMeasurements = (props) => {
  const [useForm] = useFormHook();

  const [sliderValue, setSliderValue] = useState(6);

  const groupKey = 'measurement';

  // Relevant keys for quick-entry modal
  const labelKey = 'label';
  const planarKeys = ['strike', 'dip_direction', 'dip'];
  const linearKeys = ['trend', 'plunge', 'rake'];
  const qualityKey = 'quality';

  // Relevant fields for quick-entry modal
  const planarFormName = [groupKey, MEASUREMENT_KEYS.PLANAR];
  const planarSurvey = useForm.getSurvey(planarFormName);
  const planarKeysFields = planarKeys.map(k => planarSurvey.find(f => f.name === k));
  const linearFormName = [groupKey, MEASUREMENT_KEYS.LINEAR];
  const linearSurvey = useForm.getSurvey(linearFormName);
  const linearKeysFields = linearKeys.map(k => linearSurvey.find(f => f.name === k));

  const labelField = planarSurvey.find(f => f.name === labelKey);

  useEffect(() => {
    console.log('UE AddManualMeasurements [sliderValue]', sliderValue);
    if (sliderValue <= 5) {
      props.formProps.setFieldValue(qualityKey, sliderValue.toString());
      if (props.measurementType === MEASUREMENT_KEYS.PLANAR_LINEAR) {
        props.formProps.setFieldValue('associated_orientation[0].' + qualityKey, sliderValue.toString());
      }
    }
  }, [sliderValue]);

  return (
    <React.Fragment>
      <Form {...{...props.formProps, formName: planarFormName, surveyFragment: [labelField]}}/>
      <React.Fragment>
        {(props.measurementType === MEASUREMENT_KEYS.PLANAR || props.measurementType === MEASUREMENT_KEYS.PLANAR_LINEAR)
          && <Form {...{...props.formProps, formName: planarFormName, surveyFragment: planarKeysFields}}/>
        }
        {(props.measurementType === MEASUREMENT_KEYS.LINEAR || props.measurementType === MEASUREMENT_KEYS.PLANAR_LINEAR)
          && (
            <Form {...{
              ...props.formProps,
              formName: linearFormName,
              surveyFragment: linearKeysFields,
              subkey: props.measurementType === MEASUREMENT_KEYS.PLANAR_LINEAR && 'associated_orientation',
            }}/>
          )}
        <View style={compassStyles.sliderContainer}>
          <Text style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>Quality of Measurement</Text>
          <Slider
            onSlidingComplete={setSliderValue}
            value={sliderValue}
            step={1}
            maximumValue={6}
            minimumValue={1}
            labels={['Low', '', '', '', 'High', 'N/R']}
            labelStyle={uiStyles.sliderLabel}
          />
        </View>
      </React.Fragment>
    </React.Fragment>
  );
};

export default AddManualMeasurements;
