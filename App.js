import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  Platform,
  StyleSheet
} from 'react-native';

import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

const App = () => {
  console.log(Platform.OS);

  const styles = StyleSheet.create({
    ball: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: 'blue',
      alignSelf: 'center',
    },
  });

  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? 'yellow' : 'blue',
    };
  });

  const start = useSharedValue({ x: 0, y: 0 });
  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  return (
    <SafeAreaView>
      <StatusBar barStyle='dark-content' />
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 24}}>React Native Web App Example!e</Text>
        <Animated.Image
          source={require('./src/assets/images/noimage.jpg')}
          resizeMode='contain'
          style={{ width: 100, height: 200 }}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.ball, animatedStyles]} />
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};
export default App;
