import React, {useRef, useState} from 'react';
import {Text, View} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
import * as turf from '@turf/turf/index';
import {LATITUDE, LONGITUDE} from './maps.constants';
import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';
import {useDispatch, useSelector} from 'react-redux';
import {spotReducers} from '../spots/spot.constants';

const useMaps = (props) => {
  const map = useRef(null);
  const camera = useRef(null);
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);
  const [useSpots] = useSpotsHook();

  // const [userLocationCoords, setUserLocationCoords] = useState([LONGITUDE, LATITUDE]);

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await setCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
    // throw Error('Geolocation Error');
  };

  // Get the current location from the device and set it in the state
  const setCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
          console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions,
      );
    });
  };

  // Set selected and not selected Spots to display when not editing
  const setDisplayedSpots = (selectedSpots,imageBasemap) => {
    var mappableSpots = useSpots.getMappableSpots();
    if(imageBasemap != undefined){ // if image_basemap, then filter spots by imageBasemap id
      mappableSpots = useSpots.getMappableSpots(imageBasemap);
    }
    // Filter selected Spots out of all Spots to get the not selected Spots
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedMappableSpots = mappableSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedMappableSpots = 
    mappableSpots.filter(spot => 
      !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');
    console.log('Selected Mappable Spots', selectedMappableSpots, 'Not Selected Mappable Spots',
      notSelectedMappableSpots);
    return [selectedMappableSpots, notSelectedMappableSpots];
  };

  const setSelectedSpot = (spotToSetAsSelected , imageBasemap) => {
    console.log('Set selected Spot:', spotToSetAsSelected,imageBasemap);
    let [selectedSpots,notSelectedSpots] = setDisplayedSpots(isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}],imageBasemap);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
    return [selectedSpots,notSelectedSpots]
  };

  return [{
    setCurrentLocation: setCurrentLocation,
    setDisplayedSpots:setDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
  }];
};

export default useMaps;
