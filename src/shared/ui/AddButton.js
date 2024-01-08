import React from 'react';

import {Button} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';

const AddButton = ({
                     onPress,
                     title,
                     type,
                   }) => {
  return (
    <Button
      onPress={onPress}
      containerStyle={commonStyles.buttonPadding}
      buttonStyle={commonStyles.standardButton}
      titleStyle={commonStyles.standardButtonText}
      type={type}
      icon={{
        name: 'add',
        type: 'ionicon',
        size: 35,
        color: commonStyles.iconColor.color,
      }}
      title={title}
    />
  );
};

export default AddButton;
