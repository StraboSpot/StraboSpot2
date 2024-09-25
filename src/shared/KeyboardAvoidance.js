import React, {useEffect, useState} from 'react';
import {Animated, Dimensions, Keyboard, Text, View} from 'react-native';
import uiStyles from './ui/ui.styles';

const KeyboardAvoidance = ({children, style}) => {
  const [keyboardHeight] = useState(new Animated.Value(0)); // To animate the component when the keyboard shows
  const screenHeight = Dimensions.get('window').height; // Screen height

  // Add event listeners for keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => handleKeyboardDidShow(event)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardDidHide
    );

    return () => {
      // Cleanup event listeners on unmount
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Function to handle keyboard appearance
  const handleKeyboardDidShow = (event) => {
    Animated.timing(keyboardHeight, {
      toValue: event.endCoordinates.height, // Get keyboard height
      duration: 300,
      useNativeDriver: false, // Disable native driver for height animation
    }).start();
  };

  // Function to handle keyboard disappearance
  const handleKeyboardDidHide = () => {
    Animated.timing(keyboardHeight, {
      toValue: 0, // Reset to 0 when keyboard is hidden
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={[uiStyles.keyboardAvoidanceContainer, { marginBottom: keyboardHeight }, style]}>
      {children}
    </Animated.View>
  );
};

export default KeyboardAvoidance;
