import React from 'react';
import {Text, View} from 'react-native';
import uiStyles from '../ui/ui.styles';
import {Button} from 'react-native-elements';

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
