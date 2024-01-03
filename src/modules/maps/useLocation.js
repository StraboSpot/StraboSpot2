import Geolocation from '@react-native-community/geolocation';
import * as turf from '@turf/turf';
import {useDispatch} from 'react-redux';

import {setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const useLocation = () => {
  const useSpots = useSpotsHook();
  const dispatch = useDispatch();

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return (
      new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
            console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
            resolve(position.coords);
          },
          error => reject('Error getting current location: ' + (error.message ? error.message : 'Unknown Error')),
          geolocationOptions,
        );
      })
    );
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    let feature = turf.point([currentLocation.longitude, currentLocation.latitude]);
    if (currentLocation.altitude) feature.properties.altitude = currentLocation.altitude;
    if (currentLocation.accuracy) feature.properties.gps_accuracy = currentLocation.accuracy;
    const newSpot = await useSpots.createSpot(feature);
    console.log('Created new Spot at current location:', newSpot);
    dispatch(setSelectedSpot(newSpot));
    return newSpot;
  };

  return {
    getCurrentLocation: getCurrentLocation,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
  };
};

export default useLocation;
