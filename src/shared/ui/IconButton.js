import React from 'react';
import {Image, Pressable} from 'react-native';

import uiStyles from '../ui/ui.styles';

const IconButton = (props) => {

  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      delayLongPress={1000}
    >
      <Image
        containerStyle={props.containerStyle}
        style={[uiStyles.imageIcon, props.imageStyle]}
        source={props.source}
      />
    </Pressable>
  );
};

export default IconButton;
