import React from 'react';
import {TouchableOpacity, TouchableNativeFeedback, StyleSheet, Platform} from 'react-native';

import {Button} from 'react-native-elements';

import * as themes from '../styles.constants';

const buttonNoBackground = props => {
  const content = (
    <Button
      title={props.title}
      type={'clear'}
      containerStyle={[styles.button, props.style]}
      titleStyle={[styles.buttonText, props.textStyle]}
      onPress={props.onPress}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity>
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
    color: 'black',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingRight: 10,
  },
  itemIcon: {
    paddingRight: 15,
  },
});

export default buttonNoBackground;
