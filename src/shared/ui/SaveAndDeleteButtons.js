import React from 'react';

import {Button} from 'react-native-elements';

import uiStyles from '../ui/ui.styles';

const SaveAndDeleteButtons = (props) => {
  return (
    <React.Fragment>
      <Button
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

export default SaveAndDeleteButtons;
