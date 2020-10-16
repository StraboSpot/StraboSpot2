import React from 'react';
import {ActivityIndicator, TouchableOpacity, TouchableNativeFeedback, Platform} from 'react-native';

import {Image} from 'react-native-elements';

const ImageButton = props => {
  const content = (
    <Image
      source={props.source}
      style={props.style}
      PlaceholderContent={<ActivityIndicator/>}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity onPress={props.onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableNativeFeedback onPress={props.onPress}>
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
