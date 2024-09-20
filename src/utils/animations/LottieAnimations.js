import React from 'react';

import LottieView from 'lottie-react-native';

import useAnimations from '../../shared/ui/useAnimations';

const LottieAnimation = ({animationStyle, type, doesLoop}) => {
  // console.log('LOOPS IN RN', doesLoop);

  const {getAnimationType} = useAnimations();

  return (
    <LottieView
      style={[{width: 100, height: 100, alignSelf: 'center'}, animationStyle]}
      source={getAnimationType(type)}
      autoPlay
      loop={doesLoop}
    />
  );
};

export default LottieAnimation;
