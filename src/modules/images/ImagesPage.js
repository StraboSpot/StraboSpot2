import React from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {AddImageButtons, ImagesList} from '.';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotImages} from '../spots/spots.slice';

const ImagesPage = () => {
  console.log('Rendering ImagesPage...');

  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties?.images) || [];
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const saveImagesToSpot = (newImages) => {
    dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot?.properties?.id]));
    dispatch(editedSpotImages(newImages));
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton/>
      <View style={{alignItems: 'center', flex: 1}}>
        <AddImageButtons saveImages={saveImagesToSpot}/>
        <ImagesList images={images}/>
      </View>
    </View>
  );
};

export default ImagesPage;
