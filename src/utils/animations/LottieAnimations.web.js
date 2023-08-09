import React from 'react';
import {ActivityIndicator, View} from 'react-native';

import {Icon} from 'react-native-elements';

const LottieAnimation = ({doesLoop, show}) => {
  console.log('LOOPS', doesLoop);
  console.log('SHOW', show);
  // const useAnimations = useAnimationsHook();
  //
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
      {show ? <ActivityIndicator size={75}/>
        : <Icon
          reverse
          name='check'
          type='material-community'
          color='#517fa4'
          size={35}
        />}
    </View>
  );
};

export default LottieAnimation;
