import React from 'react';
import {useSelector} from 'react-redux';

const useSpots = (props) => {
  const spots = useSelector(state => state.spot.spots);

  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(spots)));
    return allSpotsCopy.filter(spot => spot.geometry && !spot.properties.strat_section_id);
  };

  const getSpotById = (spotId) => {
    return spots[spotId];
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach(obj => {
      if (spotIds.includes(obj[1].properties.id)) foundSpots.push(obj[1]);
    });
    return foundSpots;
  };

  return {
    getMappableSpots: getMappableSpots,
    getSpotById: getSpotById,
    getSpotsByIds: getSpotsByIds,
  };
};

export default useSpots;
