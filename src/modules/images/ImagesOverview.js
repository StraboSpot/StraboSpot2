import React from 'react';
import {View} from 'react-native';

import {ImagesInSpot} from '.';

const ImagesOverview = () => {
  console.log('Rendering ImagesOverview...');

  return (
    <View style={{alignItems: 'center', flex: 1}}>
      <ImagesInSpot/>
    </View>
  );
};

export default ImagesOverview;
