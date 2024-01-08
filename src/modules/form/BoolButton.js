import React from 'react';

import {Button} from 'react-native-elements';

import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const BoolButton = ({
                      fieldKey,
                      formName,
                      formProps,
                      onPress,
                      selectedKey,
                    }) => {
  const useForm = useFormHook();

  return (
    <Button
      containerStyle={formStyles.fullWidthButtonContainer}
      buttonStyle={[formStyles.formButtonSmall, {
        backgroundColor: formProps?.values[fieldKey] === selectedKey ? PRIMARY_ACCENT_COLOR
          : SECONDARY_BACKGROUND_COLOR,
      }]}
      titleProps={{
        style: formProps?.values[fieldKey] === selectedKey ? formStyles.formButtonSelectedTitle
          : formStyles.formButtonTitle,
      }}
      title={useForm.getLabel(fieldKey, formName)}
      type={'outline'}
      onPress={onPress}
    />
  );
};

export default BoolButton;
