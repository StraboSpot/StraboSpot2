import * as turf from '@turf/turf';
import {useDispatch, useSelector} from 'react-redux';

import {setMapSymbols} from './maps.slice';
import {isEmpty} from '../../shared/Helpers';
import {useSpots} from '../spots';

const useMapFeatures = () => {
  const dispatch = useDispatch();

  const {getMappableSpots} = useSpots();

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const selectedSymbols = useSelector(state => state.map.symbolsOn) || [];
  const stratSection = useSelector(state => state.map.stratSection);
  const mapSymbols = useSelector(state => state.map.mapSymbols);

  // All Spots mapped on current map
  const getAllMappedSpots = () => {
    const spotsWithGeometry = getMappableSpots();      // Spots with geometry
    let mappedSpots;
    if (currentImageBasemap) {
      mappedSpots = spotsWithGeometry.filter(
        spot => spot.properties.image_basemap && spot.properties.image_basemap === currentImageBasemap.id);
    }
    else if (stratSection) {
      mappedSpots = spotsWithGeometry.filter(
        spot => spot.properties.strat_section_id && spot.properties.strat_section_id === stratSection.strat_section_id);
    }
    else {
      mappedSpots = spotsWithGeometry.filter(
        spot => !spot.properties.strat_section_id && !spot.properties.image_basemap);
    }
    // console.log('All Mapped Active Spots on this map', mappedSpots);
    // console.log('Number of Active Spots Mapped on this map:', mappedSpots.length);
    return mappedSpots;
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {

    let mappedSpots = getAllMappedSpots();
    updateMapSymbols(mappedSpots);

    // If any map symbol toggle is ON filter out the Point features & Spots that are not visible
    if (!isAllSymbolsOn) mappedSpots = getVisibleMappedSpots(mappedSpots);

    // Separate selected Spots and not selected Spots (Point Spots need to be in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedMappedSpots = mappedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedMappedSpots = mappedSpots.filter(spot => !selectedIds.includes(spot.properties.id)
      || spot.geometry.type === 'Point');

    // console.log('Selected Spots to Display on this Map:', selectedMappedSpots);
    // console.log('Not Selected Spots to Display on this Map:', notSelectedMappedSpots);
    return [selectedMappedSpots, notSelectedMappedSpots];
  };

  // Spots with multiple measurements become multiple features, one feature for each measurement
  const getSpotsAsFeatures = (spotsToFeatures) => {
    let mappedFeatures = [];
    spotsToFeatures.map((spot) => {
      if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint')
        && !isEmpty(spot.properties.orientation_data)) {
        spot.properties.orientation_data.map((orientation, i) => {
          if (!isEmpty(orientation)) {
            const feature = JSON.parse(JSON.stringify(spot));
            delete feature.properties.orientation_data;
            !isEmpty(orientation.associated_orientation)
            && orientation.associated_orientation.map((associatedOrientation) => {
              feature.properties.orientation = associatedOrientation;
              mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
            });
            feature.properties.orientation = orientation;
            //feature.properties.orientation_num = i.toString();
            mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
          }
          else console.log('Stupid spot', spot.properties.id);
        });
      }
      else if (spot.geometry.type === 'GeometryCollection') {
        spot.geometry.geometries.forEach((g, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          if (i % 2 === 1) feature.properties.isInterbed = true;
          feature.geometry = g;
          mappedFeatures.push(feature);
        });
      }
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });
    return mappedFeatures;
  };

  // Point Spots currently visible on the map (i.e. not toggled off in the Map Symbol Switcher)
  const getVisibleMappedSpots = (mappedSpots) => {
    return (
      mappedSpots.filter(spot => turf.getType(spot) !== 'Point'
        || (spot.properties.orientation_data
          && !isEmpty(spot.properties.orientation_data.filter(orientation => orientation.feature_type
            && selectedSymbols.includes(orientation.feature_type)))))
    );
  };

  // Gather and set the feature types that are present in the mapped Spots
  const updateMapSymbols = (mappedSpots) => {
    const featureTypes = mappedSpots.reduce((acc, spot) => {
      const spotFeatureTypes = spot.properties.orientation_data
        && spot.properties.orientation_data.reduce((acc1, orientation) => {
          return orientation?.feature_type ? [...new Set([...acc1, orientation.feature_type])] : acc1;
        }, []);
      return spotFeatureTypes ? [...new Set([...acc, ...spotFeatureTypes])] : acc;
    }, []);
    if (JSON.stringify(mapSymbols) !== JSON.stringify(featureTypes)) dispatch(setMapSymbols(featureTypes));
  };

  return {
    getAllMappedSpots: getAllMappedSpots,
    getDisplayedSpots: getDisplayedSpots,
    getSpotsAsFeatures: getSpotsAsFeatures,
  };
};

export default useMapFeatures;
