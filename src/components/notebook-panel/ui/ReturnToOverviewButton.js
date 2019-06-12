import buttonStyles from "../ui/ui.styles";
import {Button} from "react-native-elements/src/index";
import React from "react";

const returnToOverviewButton = props => {
  return (
    <Button
      icon={{
        name: 'arrow-back',
        size: 20,
        color: 'black'
      }}
      containerStyle={buttonStyles.backButton}
      titleStyle={{color: 'blue'}}
      title={'Return to Overview'}
      type={'clear'}
      onPress={() => props.onPress()}
    />
  )
};

export default returnToOverviewButton;
