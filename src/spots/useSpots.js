import React from 'react';
import {useSelector} from 'react-redux';
import {Text, View} from 'react-native';

const useSpots = (props) => {
  const spots = useSelector(state => state.spot.spots);

  const getSpotById = (spotId) => {
    return spots[spotId];
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach(obj => {
      if (spotIds.includes(obj[1].properties.id)) {
        foundSpots.push(obj[1]);
      }
    });
      return foundSpots;
  };

  const spotHelpers = {
    getSpotById: getSpotById,
    getSpotsByIds: getSpotsByIds,
  };

  return [spotHelpers];
};

export default useSpots;
