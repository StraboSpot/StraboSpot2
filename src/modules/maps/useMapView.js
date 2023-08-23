import {useDispatch, useSelector} from 'react-redux';

import {isEqual} from '../../shared/Helpers';
import {setCenter, setZoom} from './maps.slice';

const useMapView = () => {
  const dispatch = useDispatch();
  const center = useSelector(state => state.map.center);
  const zoom = useSelector(state => state.map.zoom);

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

  return {
    setMapView: setMapView,
  };
};

export default useMapView;
