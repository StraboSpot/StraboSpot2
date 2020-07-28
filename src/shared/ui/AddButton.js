import React from 'react';

import {Button} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';

const AddButton = (props) => {
  return (
    <Button
      onPress={props.onPress}
      containerStyle={commonStyles.buttonPadding}
      buttonStyle={commonStyles.standardButton}
      titleStyle={commonStyles.standardButtonText}
      icon={{
        name: 'add',
        type: 'ionicon',
        size: 35,
        color: commonStyles.iconColor.color,
      }}
      title={props.title}
    />
  );
};

export default AddButton;
