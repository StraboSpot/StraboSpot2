import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform, Image} from "react-native";
import React from "react";

const iconButton = props => {
  const content = (
    <View
      activeOpacity={0.7}
      style={props.style}>
      <Image
        target={props.name}
        source={props.source}
        style={[styles.FloatingButtonStyle, props.style]}
      />
      <Text style={props.textStyle}>{props.children}</Text>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity style={props.style} onPress={props.onPress}>
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

const styles = StyleSheet.create({
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 65,
    height: 65,
  },
});

export default iconButton;
