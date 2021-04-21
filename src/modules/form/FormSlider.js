import React from 'react';
import {View} from 'react-native';

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
      <View style={{backgroundColor: SECONDARY_BACKGROUND_COLOR}}>
        <Slider
          onSlidingComplete={(value) => props.formRef.current?.setFieldValue(props.fieldKey,
            choices.map(c => c.name)[value - 1])}
          value={choices.map(c => c.name).indexOf(props.formRef.current?.values[props.fieldKey]) || undefined}
          step={1}
          maximumValue={choices.length}
          minimumValue={0}
          labels={['None', ...choices.map(c => c.label)]}
          rotateLabels={true}
        />
      </View>
    </React.Fragment>
  );
};

export default FormSlider;
