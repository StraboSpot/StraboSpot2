import React from 'react';
import {Alert, View, Text, TouchableNativeFeedback, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import {Image} from 'react-native-elements'

import uiStyles from '../ui/ui.styles';

const IconButton = props => {

  return (
    <Image
      containerStyle={props.containerStyle}
      style={uiStyles.imageIcon}
      source={props.source}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
    />
  );
};

export default IconButton;
