import React from 'react';
import {View} from 'react-native';

import homeStyles from '../modules/home/home.style';
import RightDrawerScreen from '../modules/home/RightDrawerScreen';

const AppStack = () => {

  return (
    <View style={homeStyles.container}>
      <RightDrawerScreen/>
    </View>
  );
};

export default AppStack;
