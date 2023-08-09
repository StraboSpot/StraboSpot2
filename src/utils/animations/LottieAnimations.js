import React from 'react';

import LottieView from 'lottie-react-native';

import useAnimationsHook from '../../shared/ui/useAnimations';


const LottieAnimation = ({type, doesLoop}) => {
  console.log('LOOPS IN RN', doesLoop);

  const useAnimations = useAnimationsHook();

  return (
    <>
      <LottieView
        source={useAnimations.getAnimationType(type)}
        autoPlay
        loop={doesLoop}
      />
    </>
  );
};

export default LottieAnimation;
