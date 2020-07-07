import React from 'react';

import {Button} from 'react-native-elements';

import uiStyles from '../ui/ui.styles';

const SaveAndDeleteButtons = (props) => {
  return (
    <React.Fragment>
      <Button
        title={props.title}
        containerStyle={uiStyles.saveAndDeleteButtonContainer}
        buttonStyle={[uiStyles.saveAndDeleteButtonStyles, props.buttonStyle]}
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default SaveAndDeleteButtons;
