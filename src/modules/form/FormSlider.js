import React from 'react';
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
          onSlidingComplete={value => props.formProps?.setFieldValue(props.fieldKey, choices.map(c => c.name)[value])}
          value={choices.map(c => c.name).indexOf(props.formProps?.values[props.fieldKey]) || undefined}
          step={1}
          maximumValue={choices.length - 1}
          minimumValue={props.hasNoneChoice ? -1 : 0}
          labels={props.labels ? props.labels
            : props.hasNoneChoice ? ['None', ...choices.map(c => c.label)]
              : choices.map(c => c.label)}
          rotateLabels={props.hasRotatedLabels}
          isHideLabels={props.isHideLabels}
        />
        {props.showSliderValue && (
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <Text>
              {props.formProps.values[props.fieldKey]
                ? choices.find(c => c.name === props.formProps.values[props.fieldKey]).label
                : 'Undefined'}
            </Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default FormSlider;
