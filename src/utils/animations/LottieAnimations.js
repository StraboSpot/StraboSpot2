import React from 'react';

import LottieView from 'lottie-react-native';

import useAnimationsHook from '../../shared/ui/useAnimations';

const LottieAnimation = ({animationStyle, type, doesLoop}) => {
  // console.log('LOOPS IN RN', doesLoop);

  const useAnimations = useAnimationsHook();

  return (
    <LottieView
      style={[{width: 100, height: 100, alignSelf: 'center'}, animationStyle]}
      source={useAnimations.getAnimationType(type)}
      autoPlay
      loop={doesLoop}
    />
  );
};

export default LottieAnimation;
