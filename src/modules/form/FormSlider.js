import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import SliderBar from '../../shared/ui/SliderBar';
import uiStyles from '../../shared/ui/ui.styles';
import {useFormHook} from '../form';

const FormSlider = ({
                      choices,
                      fieldKey,
                      formProps,
                      hasNoneChoice,
                      hasRotatedLabels,
                      isHideLabels,
                      labels,
                      showSliderValue,
                      survey,
                    }) => {
  console.log('Rendering FormSlider...');

  const useForm = useFormHook();

  const field = survey.find(f => f.name === fieldKey);
  const choicesList = useForm.getChoicesByKey(survey, choices, fieldKey);

  const [sliderValue, setSliderValue] = useState(5);

  const handleSliderValue = () => {
    const value = choicesList.map(c => c.name);
    const formPropsValues = formProps?.values[fieldKey];
    const indexOfFormPropValues = value.indexOf(formPropsValues);
    console.log('formPropsValues', formPropsValues);
    console.log('indexOfFormPropValues', indexOfFormPropValues);
    // setSliderValue(b);
    return indexOfFormPropValues === -1 ? choicesList.length : indexOfFormPropValues;
  };

  const onSlideComplete = async (value) => {
    console.log('value', value);
    if (value < choicesList.length) {
      const endValue = choicesList.map(c => c.name)[value];
      console.log('Actual End Value', endValue);
      formProps?.setFieldValue(fieldKey, endValue);
      setSliderValue(endValue);
    }
    else {
      formProps?.setFieldValue(fieldKey, undefined);
      setSliderValue(undefined);
    }
  };

  return (
    <React.Fragment>
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <ListItem.Title
            style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>{field.label}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <View style={{backgroundColor: SECONDARY_BACKGROUND_COLOR, padding: 10, paddingTop: 0}}>
        <SliderBar
          onSlidingComplete={value => onSlideComplete(value)}
          // value={choicesList.map(c => c.name).indexOf(formProps?.values[fieldKey])}
          value={handleSliderValue()}
          step={1}
          minimumValue={0}
          maximumValue={hasNoneChoice ? choicesList.length : choicesList.length - 1}
          labels={labels ? labels
            : hasNoneChoice ? [...choicesList.map(c => c.label), 'N/R']
              : choicesList.map(c => c.label)}
          rotateLabels={hasRotatedLabels}
          isHideLabels={isHideLabels}
          thumbTintColor={(!sliderValue || sliderValue === 5) && 'lightgrey'}
        />
        {showSliderValue && (
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={uiStyles.sliderLabel}>
              {formProps.values[fieldKey]
                ? choicesList.find(c => c.name === formProps.values[fieldKey]).label
                : 'Not Recorded'}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default FormSlider;
