import {useRef, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {setIsMapMoved, setZoom} from './maps.slice';
import useMapView from './useMapView';

const useMapPressEvents = (mapRef) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isMapMoved = useSelector(state => state.map.isMapMoved);
  const stratSection = useSelector(state => state.map.stratSection);

  const cameraChangedTimestampRef = useRef(0);

  const {setMapView} = useMapView();

  const [zoomText, setZoomText] = useState();

  // Update spots in extent and saved view (center and zoom)
  const handleMapMoved = async (e) => {
    // console.log('Event onMapMoved Timestamp difference', e.timestamp - cameraChangedTimestampRef.current);
    if (e.timestamp - cameraChangedTimestampRef.current > 1000) {
      console.log('Map Moved. Updating View...');
      cameraChangedTimestampRef.current = e.timestamp;
      if (!isMapMoved) dispatch(setIsMapMoved(true));
      if (!currentImageBasemap && !stratSection && mapRef?.current) {
        const newCenter = await mapRef.current.getCenter();
        const newZoom = await mapRef.current.getZoom();
        dispatch(setZoom(newZoom));
        // setZoomText(newZoom);   // Update scale bar and zoom text
        setMapView(newCenter, newZoom);
      }
    }
  };

  return {
    handleMapMoved: handleMapMoved,
    // zoomText: zoomText,
  };

};

export default useMapPressEvents;
