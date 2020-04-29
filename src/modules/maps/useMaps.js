import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';

const useMaps = (props) => {
  const dispatch = useDispatch();
  const [useSpots] = useSpotsHook();

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await getCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
    // throw Error('Geolocation Error');
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
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

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    const mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    console.log('Mappable Spots', selectedSpots);

    // Filter out Spots on an image basemap
    const displayedSpots = mappableSpots.filter(
      spot => !spot.properties.image_basemap && !spot.properties.strat_section);

    let mappedFeatures = [];
    displayedSpots.map(spot => {
      if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
        spot.properties.orientation_data.map((orientation, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          delete feature.properties.orientation_data;
          orientation.associated_orientation && orientation.associated_orientation.map(associatedOrientation => {
            feature.properties.orientation = associatedOrientation;
            mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
          });
          feature.properties.orientation = orientation;
          //feature.properties.orientation_num = i.toString();
          mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
        });
      }
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });

    console.log('mp', mappedFeatures);

    // Separate selected Spots and not selected Spots (Point Spots need to in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedDisplayedSpots = mappedFeatures.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedDisplayedSpots = mappedFeatures.filter(spot => !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');

    console.log('Selected Spots to Display on this Map:', selectedDisplayedSpots);
    console.log('Not Selected Spots to Display on this Map:', notSelectedDisplayedSpots);
    return [selectedDisplayedSpots, notSelectedDisplayedSpots];
  };

  const setSelectedSpot = (spotToSetAsSelected , imageBasemap) => {
    console.log('Set selected Spot:', spotToSetAsSelected,imageBasemap);
    let [selectedSpots,notSelectedSpots] = setDisplayedSpots(isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}],imageBasemap);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
    return [selectedSpots,notSelectedSpots]
  };

  return [{
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
  }];
};

export default useMaps;
