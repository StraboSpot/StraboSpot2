import React from 'react';

import LottieView from 'lottie-react-native';

import useAnimationsHook from '../../shared/ui/useAnimations';

const LottieAnimation = ({type, doesLoop}) => {
  // console.log('LOOPS IN RN', doesLoop);

  const useAnimations = useAnimationsHook();

  return (
    <LottieView
      style={{width: 150, height: 150, alignSelf: 'center'}}
      source={useAnimations.getAnimationType(type)}
      autoPlay
      loop={doesLoop}
    />
  );
};

export default LottieAnimation;
