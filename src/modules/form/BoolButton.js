import React from 'react';

import {Button} from 'react-native-elements';

import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles} from '../form';

const BoolButton = (props) => {

  return (
    <Button
      containerStyle={{...formStyles.formButtonContainer, alignItems: 'center'}}
      buttonStyle={{
        ...formStyles.choiceButton,
        backgroundColor: props.formRef.current?.values[props.fieldKey] === props.selectedKey ? REACT_NATIVE_ELEMENTS_BLUE
          : SECONDARY_BACKGROUND_COLOR,
      }}
      titleStyle={{
        ...props.formRef.current?.values[props.fieldKey] === props.selectedKey ? formStyles.formButtonSelectedTitle
          : formStyles.formButtonTitle, fontSize: 11, paddingLeft: 30, paddingRight: 30,
      }}
      title={props.getLabel(props.fieldKey)}
      type={'outline'}
      onPress={props.onPress}
    />
  );
};

export default BoolButton;
