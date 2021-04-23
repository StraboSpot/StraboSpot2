import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const ChoiceButtons = (props) => {
  const [useForm] = useFormHook();

  return (
    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
      {useForm.getChoicesByKey(props.survey, props.choices, props.choiceFieldKey).map(choice => {
        return (
          <Button
            containerStyle={formStyles.formButtonContainer}
            buttonStyle={{
              ...formStyles.choiceButton,
              backgroundColor: props.formRef.current?.values[props.choiceFieldKey]?.includes(
                choice.name) ? REACT_NATIVE_ELEMENTS_BLUE : SECONDARY_BACKGROUND_COLOR,
            }}
            titleStyle={{
              ...props.formRef.current?.values[props.choiceFieldKey]?.includes(
                choice.name) ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle, fontSize: 11,
            }}
            title={choice.label}
            type={'outline'}
            onPress={() => props.onPress(choice.name)}
          />
        );
      })}
    </View>
  );
};

export default ChoiceButtons;
