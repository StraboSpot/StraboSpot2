import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform, Image} from "react-native";
import React from "react";

const iconButton = props => {
  const content = (
    <View
      activeOpacity={0.7}
      style={styles.TouchableOpacityStyle}>
      <Image
        target={props.name}
        source={props.source}
        style={[styles.FloatingButtonStyle, props.style]}
      />
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity style={styles.container} onPress={props.onPress}>
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
  container: {
    // flex: 1,
    // alignItems: 'center'
  },
  TouchableOpacityStyle: {
    position: 'absolute',
    right: "1%",
    // bottom: "0%",
    margin: 10,
    // shadowOffset: {width: 3, height: 3},
    // shadowColor: "black",
    // shadowOpacity: .5,

  },
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 65,
    height: 65,

  },
});

export default iconButton;
