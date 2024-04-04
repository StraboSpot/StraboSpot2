import {Platform} from 'react-native';

import * as turf from '@turf/turf';
import {useDispatch, useSelector} from 'react-redux';

import {clearedStratSection, setCenter, setCurrentImageBasemap, setStratSection, setZoom} from './maps.slice';
import useStratSectionHook from './strat-section/useStratSection';
import useMapCoordsHook from './useMapCoords';
import {isEmpty, isEqual} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

const useMapView = () => {
  const dispatch = useDispatch();
  const center = useSelector(state => state.map.center);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const stratSection = useSelector(state => state.map.stratSection);
  const zoom = useSelector(state => state.map.zoom);

  const useMapCoords = useMapCoordsHook();
  const useSpots = useSpotsHook();
  const useStratSection = useStratSectionHook();

  // If feature is mapped on geographical map, not an image basemap or strat section
  const isOnGeoMap = (feature) => {
    if (isEmpty(feature)) return false;
    return !feature.properties.image_basemap && !feature.properties.strat_section_id;
  };

  const isOnImageBasemap = feature => feature.properties?.image_basemap;

  const isOnStratSection = feature => feature.properties?.strat_section_id;

  const setMapView = (newCenter, newZoom) => {
    if (!isEqual(center, newCenter)) {
      console.log('Prev Center:', center, 'New Center:', newCenter);
      console.log('Setting new map center...');
      dispatch(setCenter(newCenter));
    }
    if (zoom !== newZoom) {
      console.log('Prev Zoom:', zoom, 'New Zoom:', newZoom);
      console.log('Setting new zoom...');
      dispatch(setZoom(newZoom));
    }
  };

  const zoomToSpot = (map, camera) => {
    if (selectedSpot && isOnGeoMap(selectedSpot)) {
      // spot selected is on geomap, but currently on image basemap mode, turn off imagebasemap mode and zoomToSpot in async mode.
      if (currentImageBasemap || stratSection) {
        dispatch(setCurrentImageBasemap(undefined));
        dispatch(clearedStratSection());
        // doZoomToSpot = true;
        // return true;
      }
      // spot selected is on geomap and mapMode is main-map, zoomToSpot in sync mode.
      else zoomToSpots([selectedSpot], map, camera);
    }
    else if (!isEmpty(selectedSpot)
      && (selectedSpot.properties.image_basemap || selectedSpot.properties.strat_section_id)) {
      // spot selected is on an image basemap or strat section, either if not on imagebasemap
      // or not on same imagebasemap as the selected spot's imagebasemap,
      // then switch to corresponding imagebasemap and zoomToSpot in asyncMode
      if (selectedSpot.properties.image_basemap
        && (!currentImageBasemap || currentImageBasemap.id !== selectedSpot.properties.image_basemap)) {
        const imageBasemapData = useSpots.getImageBasemaps().find((imgBasemap) => {
          return imgBasemap.id === selectedSpot.properties.image_basemap;
        });
        dispatch(setCurrentImageBasemap(imageBasemapData));
      }
      else if (selectedSpot.properties.strat_section_id
        && (!stratSection || stratSection.strat_section_id !== selectedSpot.properties.strat_section_id)) {
        const stratSectionSettings = useStratSection.getStratSectionSettings(selectedSpot.properties.strat_section_id);
        if (stratSectionSettings) {
          dispatch(setStratSection(stratSectionSettings));
        }
      }
      //spot selected is already on the same image basemap or strat section, zoomToSpot in sync mode
      else {
        const selectedSpotCopy = JSON.parse(JSON.stringify(selectedSpot));
        const spotInLatLng = useMapCoords.convertImagePixelsToLatLong(selectedSpotCopy);
        zoomToSpots([spotInLatLng], map, camera);
      }
    }
    else {
      // handle other maps
    }
  };

  const zoomToSpots = async (spotsToZoomTo, map, camera) => {
    if (spotsToZoomTo.every(s => isOnGeoMap(s)) || spotsToZoomTo.every(s => isOnImageBasemap(s))
      || spotsToZoomTo.every(s => isOnStratSection(s))) {
      if (camera || Platform.OS === 'web') {
        try {
          if (spotsToZoomTo.length === 1) {
            const centroid = turf.centroid(spotsToZoomTo[0]);
            if (Platform.OS === 'web') map.flyTo({center: turf.getCoord(centroid)});
            else camera.flyTo(turf.getCoord(centroid));
          }
          else if (spotsToZoomTo.length > 1) {
            const features = turf.featureCollection(spotsToZoomTo);
            const [minX, minY, maxX, maxY] = turf.bbox(features);  //bbox extent in minX, minY, maxX, maxY order
            if (Platform.OS === 'web') map.fitBounds([[maxX, minY], [minX, maxY]], {padding: 100, duration: 2500});
            else camera.fitBounds([maxX, minY], [minX, maxY], 100, 2500);
          }
        }
        catch (err) {
          throw Error('Error Zooming To Extent of Spots', err);
        }
      }
      else throw Error('Error Getting Map Camera');
    }
    else throw Error('Error Zooming To Extent of Spots');
  };

  return {
    isOnGeoMap: isOnGeoMap,
    setMapView: setMapView,
    zoomToSpot: zoomToSpot,
    zoomToSpots: zoomToSpots,
  };
};

export default useMapView;
