import React from 'react';
import {Pressable} from 'react-native';

import {Image} from 'react-native-elements';

import uiStyles from '../ui/ui.styles';

const IconButton = ({
                      containerStyle,
                      imageStyle,
                      onLongPress,
                      onPress,
                      source,
                      style,
                    }) => {

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={1000}
      style={style}
    >
      <Image
        containerStyle={containerStyle}
        style={[uiStyles.imageIcon, imageStyle]}
        source={source}
      />
    </Pressable>
  );
};

export default IconButton;
