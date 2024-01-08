import React from 'react';
import {ActivityIndicator, Platform, TouchableNativeFeedback, TouchableOpacity} from 'react-native';

import {Image} from 'react-native-elements';

const ImageButton = ({
                       onPress,
                       source,
                       style,
                     }) => {
  const content = (
    <Image
      source={source}
      style={style}
      PlaceholderContent={<ActivityIndicator/>}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableNativeFeedback onPress={onPress}>
      {content}
    </TouchableNativeFeedback>
  );

};

// const home = StyleSheet.create({
//   button: {
//     paddingLeft: 15,
//     paddingRight: 15,
//   },
//   buttonText: {
//     color: "black",
//     fontSize: themes.PRIMARY_TEXT_SIZE,
//     paddingRight: 10
//   },
//   itemIcon: {
//     paddingRight: 15,
//   }
// });

export default ImageButton;
