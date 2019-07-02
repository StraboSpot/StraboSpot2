import React from 'react';
import {TouchableOpacity, TouchableNativeFeedback, Text, View, StyleSheet, Platform} from "react-native";
import {Icon} from 'react-native-elements';
import * as themes from "../styles.constants";

// import Icon from "react-native-vector-icons/Ionicons";

const buttonNoBackground = props => {
  const content = (
    <View style={[styles.button, props.style]}>
      <Icon
        name={props.iconName}
        type={props.iconType}
        color={props.iconColor}
        iconStyle={props.iconStyle}
        size={props.size}
      />
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
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingRight: 10
  },
  itemIcon: {
    paddingRight: 15,
  }
});

export default buttonNoBackground;
