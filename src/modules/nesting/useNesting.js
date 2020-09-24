import * as turf from '@turf/turf';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {useSpotsHook} from '../spots';

const useNesting = (props) => {
  const [useSpots] = useSpotsHook();
  const spots = useSelector(state => state.spot.spots);

  // Is spot 1 completely within spot 2?
  // Boolean-within returns true if the first geometry is completely within the second geometry.
  const isWithin = (spot1, spot2) => {
    let boolWithin = false;
    const validTypesForBooleanWithin = {
      'Point': ['MultiPoint', 'LineString', 'Polygon'],
      'MultiPoint': ['MultiPoint', 'LineString', 'Polygon', 'MultiPolygon'],
      'LineString': ['LineString', 'Polygon', 'MultiPolygon'],
      'Polygon': ['Polygon', 'MultiPolygon'],
    };
    try {
      // Make sure we're using booleanWithin with valid types
      if (Object.keys(validTypesForBooleanWithin).includes(spot1.geometry.type)
        && validTypesForBooleanWithin[spot1.geometry.type].includes(spot2.geometry.type)) {
        boolWithin = turf.booleanWithin(spot1, spot2);
      }
      // Handle Geometry Collections
      else if (spot1.geometry.type === 'GeometryCollection') {
        spot1.geometry.geometries.forEach(geometry1 => {
          if (!boolWithin && Object.keys(validTypesForBooleanWithin).includes(geometry1.type)
            && validTypesForBooleanWithin[geometry1].includes(spot2.geometry.type)) {
            boolWithin = turf.booleanWithin(geometry1, spot2.geometry.type);
          }
          else if (!boolWithin && spot2.geometry.type === 'GeometryCollection') {
            spot2.geometry.geometries.forEach(geometry2 => {
              if (!boolWithin && Object.keys(validTypesForBooleanWithin).includes(geometry1.type)
                && validTypesForBooleanWithin[geometry1].includes(geometry2)) {
                boolWithin = turf.booleanWithin(geometry1, geometry2);
              }
            });
          }
        });
      }
      else if (spot2.geometry.type === 'GeometryCollection') {
        spot2.geometry.geometries.forEach(geometry2 => {
          if (!boolWithin && Object.keys(validTypesForBooleanWithin).includes(spot1.geometry.type)
            && validTypesForBooleanWithin[spot1.geometry.type].includes(geometry2.type)) {
            boolWithin = turf.booleanWithin(spot1.geometry, geometry2);
          }
        });
      }
    }
    catch (e) {
      console.error('Error with Spot geometry! Spot 1:', spot1, 'Spot 2:', spot2, 'Error:', e);
    }
    return boolWithin;
  };

  // Get all the children Spots of thisSpot, based on image basemaps, strat sections and geometry
  // & also Spots stored in spot.properties.nesting not nested through geometry
  function getChildrenSpots(thisSpot) {
    let childrenSpots = [];
    // Find children spots based on image basemap
    if (thisSpot.properties.images) {
      const imageBasemaps = thisSpot.properties.images.map(image => image.id);
      const imageBasemapChildrenSpots = Object.values(spots).filter(
        spot => imageBasemaps.includes(spot.properties.image_basemap));
      childrenSpots.push(imageBasemapChildrenSpots);
    }
    // Find children spots based on strat section
    if (thisSpot.properties.sed && thisSpot.properties.sed.strat_section) {
      const stratSectionChildrenSpots = Object.values(spots).filter(spot => {
        return thisSpot.properties.sed.strat_section.strat_section_id === spot.properties.strat_section_id;
      });
      childrenSpots.push(stratSectionChildrenSpots);
    }
    // Find children spots not nested through geometry - nested directly in spot.properties.nesting
    if (thisSpot.properties.nesting) {
      let nonGeomChildrenSpots = [];
      thisSpot.properties.nesting.forEach(spotId => {
        if (useSpots.getSpotById(spotId)) nonGeomChildrenSpots.push(useSpots.getSpotById(spotId));
        else {
          thisSpot.properties.nesting = thisSpot.properties.nesting.filter(nestingId => nestingId !== spotId);
          if (isEmpty(thisSpot.properties.nesting)) delete thisSpot.properties.nesting;
        }
      });
      childrenSpots.push(nonGeomChildrenSpots);
    }
    childrenSpots = childrenSpots.flat();
    // Find children spots based on geometry
    // Only non-point features can have children
    if (thisSpot.geometry && thisSpot.geometry.type) {
      if (thisSpot.geometry.type !== 'Point') {
        const otherSpots = Object.values(spots).filter(spot => {
          return spot.geometry && spot.properties.id !== thisSpot.properties.id;
        });
        otherSpots.forEach(spot => {
          if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap)
            || (thisSpot.properties.image_basemap && spot.properties.image_basemap
              && thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
            if (thisSpot.geometry.type && thisSpot.geometry.type === 'Polygon'
              || thisSpot.geometry.type === 'MutiPolygon'
              || thisSpot.geometry.type === 'GeometryCollection') {
              if (isWithin(spot, thisSpot)) childrenSpots.push(spot);
            }
          }
        });
      }
    }
    return childrenSpots;
  }

  // Get the children of an array of Spots
  function getChildrenOfSpots(spots1) {
    let allChildrenSpots = [];
    spots1.forEach(spot => {
      const childrenSpots = getChildrenSpots(spot);
      if (!isEmpty(childrenSpots)) allChildrenSpots.push(childrenSpots);
    });
    return allChildrenSpots.flat();
  }

  // Get i generations of children spots for thisSpot
  function getChildrenGenerationsSpots(thisSpot, i) {
    let childrenGenerations = [];
    let childSpots = [thisSpot];
    Array.from({length: i}, () => {
      childSpots = getChildrenOfSpots(childSpots);
      // Remove a child Spot if already in the list of children generation Spots
      childSpots = childSpots.filter(childSpot => {
        return !childrenGenerations.flat().find(knownChildSpot => {
          return childSpot.properties.id === knownChildSpot.properties.id;
        });
      });
      if (!isEmpty(childSpots)) childrenGenerations.push(childSpots);
    });
    console.log('Found Children Generations:', childrenGenerations);
    return childrenGenerations;
  }

  // Get all the parent Spots of thisSpot, based on image basemaps, strat sections and geometry
  // & also Spots stored in spot.properties.nesting not nested through geometry
  function getParentSpots(thisSpot) {
    let parentSpots = [];
    // Find parent spots based on image basemap
    if (thisSpot.properties.image_basemap) {
      const parentImageBasemapSpot = Object.values(spots).find(spot => {
        return spot.properties.images
          && spot.properties.images.find(image => image.id === thisSpot.properties.image_basemap);
      });
      parentSpots.push(parentImageBasemapSpot);
    }
    // Find parent spots based on strat section
    if (thisSpot.properties.strat_section_id) {
      const parentStratSectionSpot = Object.values(spots).find(spot => {
        return spot.properties.sed
          && spot.properties.sed.find(sed => sed.strat_section_id === thisSpot.properties.strat_section_id);
      });
      parentSpots.push(parentStratSectionSpot);
    }
    // Find parent Spots not nested through geometry - nested directly in spot.properties.nesting
    const parentNonGeomSpot = Object.values(spots).find(spot => {
      return spot.properties.nesting && spot.properties.nesting.includes(thisSpot.properties.id);
    });
    if (parentNonGeomSpot) parentSpots.push(parentNonGeomSpot);
    parentSpots = parentSpots.flat();
    // Find parent spots based on geometry
    if (thisSpot.geometry) {
      const otherSpots = Object.values(spots).filter(spot => {
        return spot.geometry && spot.properties.id !== thisSpot.properties.id;
      });
      otherSpots.forEach(spot => {
        if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap)
          || (thisSpot.properties.image_basemap && spot.properties.image_basemap
            && thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
          if (spot.geometry.type && (spot.geometry.type === 'Polygon'
            || spot.geometry.type === 'MutiPolygon' || spot.geometry.type === 'GeometryCollection')) {
            if (isWithin(thisSpot, spot)) parentSpots.push(spot);
          }
        }
      });
    }
    return parentSpots;
  }

  // Get the parents of an array of Spots
  function getParentsOfSpots(spots1) {
    let allParentSpots = [];
    spots1.forEach(spot => {
      const parentSpots = getParentSpots(spot);
      if (!isEmpty(parentSpots)) allParentSpots.push(parentSpots);
    });
    return allParentSpots.flat();
  }

  // Get i generations of parent spots for thisSpot
  const getParentGenerationsSpots = (thisSpot, i) => {
    let parentGenerations = [];
    let parentSpots = [thisSpot];

    Array.from({length: i}, () => {
      parentSpots = getParentsOfSpots(parentSpots);
      // Remove a parent Spot if already in the list of parent generation Spots
      parentSpots = parentSpots.filter(parentSpot => {
        return !parentGenerations.flat().find(knownParentSpot => {
          return parentSpot.properties.id === knownParentSpot.properties.id;
        });
      });
      if (!isEmpty(parentSpots)) parentGenerations.push(parentSpots);
    });
    console.log('Found Parent Generations', parentGenerations);
    return parentGenerations;
  };

  return [{
    getChildrenGenerationsSpots: getChildrenGenerationsSpots,
    getParentGenerationsSpots: getParentGenerationsSpots,
  }];
};

export default useNesting;
