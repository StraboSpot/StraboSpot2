import React from 'react';
import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform} from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";

const buttonNoBackground = props => {
  const content = (
    <View style={[styles.button, props.style]}>
      {/*<MaterialCommunityIcons.Ionicon*/}
        {/*style={[styles.itemIcon, props.style]}*/}
        {/*name={props.name}*/}
        {/*size={props.size}*/}
        {/*color={props.color}/>*/}
      <Text style={[styles.buttonText, props.textStyle]}>{props.children}</Text>
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
    paddingLeft: 15,
    paddingRight: 15,
  },
  buttonText: {
    color: "black",
    fontSize: 16
  },
  itemIcon: {
    paddingRight: 15,
  }
});

export default buttonNoBackground;
