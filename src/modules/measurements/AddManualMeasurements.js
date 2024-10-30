import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {MEASUREMENT_KEYS} from './measurements.constants';
import commonStyles from '../../shared/common.styles';
import SliderBar from '../../shared/ui/SliderBar';
import compassStyles from '../compass/compass.styles';
import {Form, useForm} from '../form';

const AddManualMeasurements = (props) => {
  const {getSurvey} = useForm();

  const [sliderValue, setSliderValue] = useState(6);

  const groupKey = 'measurement';

  // Relevant keys for quick-entry modal
  const labelKey = 'label';
  const planarKeys = ['strike', 'dip_direction', 'dip'];
  const linearKeys = ['trend', 'plunge', 'rake'];
  const qualityKey = 'quality';

  // Relevant fields for quick-entry modal
  const planarFormName = [groupKey, MEASUREMENT_KEYS.PLANAR];
  const planarSurvey = getSurvey(planarFormName);
  const planarKeysFields = planarKeys.map(k => planarSurvey.find(f => f.name === k));
  const linearFormName = [groupKey, MEASUREMENT_KEYS.LINEAR];
  const linearSurvey = getSurvey(linearFormName);
  const linearKeysFields = linearKeys.map(k => linearSurvey.find(f => f.name === k));

  const labelField = planarSurvey.find(f => f.name === labelKey);

  useEffect(() => {
    console.log('UE AddManualMeasurements [sliderValue]', sliderValue);
    const sliderValueString = sliderValue <= 5 ? sliderValue.toString() : undefined;
    props.formProps.setFieldValue(qualityKey, sliderValueString);
    if (props.measurementType === MEASUREMENT_KEYS.PLANAR_LINEAR) {
      props.formProps.setFieldValue('associated_orientation[0].' + qualityKey, sliderValueString);
    }
  }, [sliderValue]);

  return (
    <>
      <Form {...{...props.formProps, formName: planarFormName, surveyFragment: [labelField]}}/>
      <>
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
          <SliderBar
            onSlidingComplete={setSliderValue}
            value={sliderValue}
            step={1}
            maximumValue={6}
            minimumValue={1}
            labels={['Low', '', '', '', 'High', 'N/R']}
          />
        </View>
      </>
    </>
  );
};

export default AddManualMeasurements;
