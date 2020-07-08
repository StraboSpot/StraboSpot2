import React from 'react';

import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

import customMapStyles from '../../modules/maps/custom-maps/customMaps.styles';
import commonStyles from '../../shared/common.styles';

const AddButton = (props) => {
  return (
    <Button
      onPress={props.onPress}
      containerStyle={customMapStyles.buttonContainer}
      buttonStyle={commonStyles.standardButton}
      titleStyle={commonStyles.standardButtonText}
      icon={
        <Icon
          style={customMapStyles.icons}
          name={'ios-add'}
          size={35}
          color={customMapStyles.iconColor.color}/>
      }
      title={props.title}
    />
  );
};

export default AddButton;
