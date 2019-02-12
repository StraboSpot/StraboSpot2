import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform, Image} from "react-native";
import React from "react";

const squareIconButton = props => {
  const content = (
    <View
      activeOpacity={0.7}
      style={styles.TouchableOpacityStyle}>
      <Image
        source={props.source}
        style={styles.FloatingButtonStyle}
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
    // width: 50,
    // height: 50,
    // alignItems: 'center',
    // justifyContent: 'center',
    right: "5%",
    bottom: "0%",
  },
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 70,
    height: 70,
    //backgroundColor:'black'
  },
});

export default squareIconButton;