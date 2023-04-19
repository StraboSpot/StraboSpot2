import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import Slider from '../../shared/ui/Slider';
import {useFormHook} from '../form';

const FormSlider = (props) => {
  const [useForm] = useFormHook();

  const field = props.survey.find(f => f.name === props.fieldKey);
  const choices = useForm.getChoicesByKey(props.survey, props.choices, props.fieldKey);

  const [sliderValue, setSliderValue] = useState(5);

  // useEffect(() => {
  //   console.log('Slider Value', sliderValue);
  // }, [sliderValue, props.formProps]);

  const handleSliderValue = () => {
    const value = choices.map(c => c.name);
    const formPropsValues = props.formProps?.values[props.fieldKey];
    const indexOfFormPropValues = value.indexOf(formPropsValues);
    console.log('formPropsValues', formPropsValues);
    console.log('indexOfFormPropValues', indexOfFormPropValues);
    // setSliderValue(b);
    return indexOfFormPropValues === -1 ? choices.length : indexOfFormPropValues;
  };

  const onSlideComplete = async (value) => {
    console.log('value', value);
    if (value < choices.length) {
      const endValue = choices.map(c => c.name)[value];
      console.log('Actual End Value', endValue);
      props.formProps?.setFieldValue(props.fieldKey, endValue);
      setSliderValue(endValue);
    }
    else {
      props.formProps?.setFieldValue(props.fieldKey, undefined);
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
        <Slider
          onSlidingComplete={value => onSlideComplete(value)}
          // value={choices.map(c => c.name).indexOf(props.formProps?.values[props.fieldKey])}
          value={handleSliderValue()}
          step={1}
          minimumValue={0}
          maximumValue={props.hasNoneChoice ? choices.length : choices.length - 1}
          labels={props.labels ? props.labels
            : props.hasNoneChoice ? [...choices.map(c => c.label), 'N/R']
              : choices.map(c => c.label)}
          rotateLabels={props.hasRotatedLabels}
          isHideLabels={props.isHideLabels}
          thumbTintColor={(!sliderValue || sliderValue === 5) && 'lightgrey'}
        />
        {props.showSliderValue && (
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <Text>
              {props.formProps.values[props.fieldKey]
                ? choices.find(c => c.name === props.formProps.values[props.fieldKey]).label
                : 'Not Recorded'}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default FormSlider;
