import React from 'react';
import {ButtonGroup} from 'react-native-elements';

const buttonGroup = (props) => {
  return (
    <React.Fragment>
      <ButtonGroup
        selectedIndex={props.selectedIndex}
        buttons={props.buttons}
        containerStyle={props.containerStyle}
        buttonStyle={props.buttonStyle}
        textStyle={props.textStyle}
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default buttonGroup;
