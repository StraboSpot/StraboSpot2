import React from 'react';

import {Button} from 'react-native-elements';

import uiStyles from '../ui/ui.styles';

const ButtonRounded = (props) => {
  return (
    <React.Fragment>
      <Button
        icon={props.icon}
        title={props.title}
        containerStyle={[uiStyles.saveAndDeleteButtonContainer, props.containerStyle]}
        buttonStyle={[uiStyles.saveAndDeleteButtonStyles, props.buttonStyle]}
        titleStyle={props.titleStyle}
        onPress={props.onPress}
        disabled={props.disabled}
      />
    </React.Fragment>
  );
};

export default ButtonRounded;
