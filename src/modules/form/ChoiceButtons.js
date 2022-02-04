import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const ChoiceButtons = (props) => {
  const [useForm] = useFormHook();

  const buttonStyle = props.size === 'small' ? formStyles.formButtonSmall
    : props.size === 'large' ? formStyles.formButtonLarge
      : formStyles.formButton;

  return (
    <View style={formStyles.halfWidthButtonsContainer}>
      {useForm.getChoicesByKey(props.survey, props.choices, props.choiceFieldKey).map(choice => {
        return (
          <Button
            containerStyle={formStyles.halfWidthButtonContainer}
            buttonStyle={[buttonStyle, {
              backgroundColor: props.formProps?.values[props.choiceFieldKey]?.includes(choice.name)
                ? PRIMARY_ACCENT_COLOR
                : SECONDARY_BACKGROUND_COLOR,
            }]}
            title={choice.label}
            titleProps={{
              style: props.formProps?.values[props.choiceFieldKey]?.includes(choice.name)
                ? formStyles.formButtonSelectedTitle
                : formStyles.formButtonTitle,
              numberOfLines: 2,
              ellipsizeMode: 'tail',
            }}
            type={'outline'}
            onPress={() => props.onPress(choice.name)}
          />
        );
      })}
    </View>
  );
};

export default ChoiceButtons;
