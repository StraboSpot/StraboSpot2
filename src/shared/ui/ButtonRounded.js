import React from 'react';

import {Button} from 'react-native-elements';

import uiStyles from '../ui/ui.styles';

const ButtonRounded = ({
                         buttonStyle,
                         containerStyle,
                         disabled,
                         icon,
                         onPress,
                         title,
                         titleStyle,
                       }) => {
  return (
    <React.Fragment>
      <Button
        icon={icon}
        title={title}
        containerStyle={[uiStyles.saveAndDeleteButtonContainer, containerStyle]}
        buttonStyle={[uiStyles.saveAndDeleteButtonStyles, buttonStyle]}
        titleStyle={titleStyle}
        onPress={onPress}
        disabled={disabled}
      />
    </React.Fragment>
  );
};

export default ButtonRounded;
