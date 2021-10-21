import React from 'react';

import {Button} from 'react-native-elements';

import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const BoolButton = (props) => {
  const [useForm] = useFormHook();

  return (
    <Button
      containerStyle={formStyles.fullWidthButtonContainer}
      buttonStyle={[formStyles.formButtonSmall, {
        backgroundColor: props.formProps?.values[props.fieldKey] === props.selectedKey ? REACT_NATIVE_ELEMENTS_BLUE
          : SECONDARY_BACKGROUND_COLOR,
      }]}
      titleProps={{
        style: props.formProps?.values[props.fieldKey] === props.selectedKey ? formStyles.formButtonSelectedTitle
          : formStyles.formButtonTitle,
      }}
      title={useForm.getLabel(props.fieldKey, props.formName)}
      type={'outline'}
      onPress={props.onPress}
    />
  );
};

export default BoolButton;
