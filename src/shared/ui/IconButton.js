import React from 'react';
import {Image,TouchableOpacity} from 'react-native';

import uiStyles from '../ui/ui.styles';

const IconButton = props => {

  return (
    <TouchableOpacity onPress={props.onPress} onLongPress={props.onLongPress}>
      <Image
        containerStyle={props.containerStyle}
        style={uiStyles.imageIcon}
        source={props.source}
      />
    </TouchableOpacity>
  );
};

export default IconButton;
