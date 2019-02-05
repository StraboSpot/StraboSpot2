import React from 'react';
import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform} from "react-native";

const buttonWithBackground = props => {
  const content = (
    <View style={[styles.button, {backgroundColor: props.color}]}>
      <Text style={styles.buttonText}>{props.children}</Text>
    </View>
  );

  if (Platform.OS === 'android') {
    return(
      <TouchableNativeFeedback>
        {content}
      </TouchableNativeFeedback>
    );
  }
  return(
    <TouchableOpacity onPress={props.onPress}>
      {content}
    </TouchableOpacity>
  );

};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 5,
    borderRadius: 35,
    paddingLeft: 50,
    paddingRight: 50,
    alignItems: 'center'
  },
  buttonText: {
    color: "white",
  }
});

export default buttonWithBackground;