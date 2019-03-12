import React from 'react';
import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const buttonWithBackground = props => {
  const content = (
    <View style={[styles.button, {backgroundColor: props.color}, props.style]}>
      <Icon
        style={styles.itemIcon}
        name={props.name}
        size={30}
        color={"white"}/>
      <Text style={[styles.buttonText, props.style]}>{props.children}</Text>
    </View>
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

const styles = StyleSheet.create({
  button: {
    paddingLeft: 50,
    paddingRight: 50,
    margin: 10,
    borderRadius: 35,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
  },
  itemIcon: {
    paddingRight: 20
  }
});

export default buttonWithBackground;
