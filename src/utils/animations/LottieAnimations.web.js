import React from 'react';
import {ActivityIndicator, View} from 'react-native';

import {Icon} from 'react-native-elements';

const LottieAnimation = ({doesLoop, show, error}) => {
  console.log('LOOPS', doesLoop);
  console.log('SHOW', show);
  // const useAnimations = useAnimationsHook();
  //
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
      {show ? <ActivityIndicator size={75}/>
        : !error ? <Icon
          reverse
          name={'check-circle-outline'}
          type={'material-community'}
          color={'#517fa4'}
          size={35}
        />
          : <Icon
            reverse
            name={'alert-circle-outline'}
            type={'material-community'}
            color={'#930808'}
            size={35}
            />
      }
    </View>
  );
};

export default LottieAnimation;
