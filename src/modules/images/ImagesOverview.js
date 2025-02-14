import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import {ImagesList} from '.';

const ImagesOverview = () => {
  console.log('Rendering ImagesOverview...');

  const images = useSelector(state => state.spot.selectedSpot.properties?.images) || [];

  return (
    <View style={{alignItems: 'center', flex: 1}}>
      <ImagesList images={images}/>
    </View>
  );
};

export default ImagesOverview;
