import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useForm} from '../form';

const ChoiceButtons = ({
                         choiceFieldKey,
                         choices,
                         formProps,
                         onPress,
                         size,
                         survey,
                       }) => {
  const {getChoicesByKey} = useForm();

  const buttonStyle = size === 'small' ? formStyles.formButtonSmall
    : size === 'large' ? formStyles.formButtonLarge
      : formStyles.formButton;

  return (
    <View style={formStyles.halfWidthButtonsContainer}>
      {getChoicesByKey(survey, choices, choiceFieldKey).map((choice) => {
        return (
          <Button
            key={choice.name}
            containerStyle={formStyles.halfWidthButtonContainer}
            buttonStyle={[buttonStyle, {
              backgroundColor: formProps?.values[choiceFieldKey]?.includes(choice.name)
                ? PRIMARY_ACCENT_COLOR
                : SECONDARY_BACKGROUND_COLOR,
            }]}
            title={choice.label}
            titleProps={{
              style: formProps?.values[choiceFieldKey]?.includes(choice.name)
                ? formStyles.formButtonSelectedTitle
                : formStyles.formButtonTitle,
              numberOfLines: 2,
              ellipsizeMode: 'tail',
            }}
            type={'outline'}
            onPress={() => onPress(choice.name)}
          />
        );
      })}
    </View>
  );
};

export default ChoiceButtons;
