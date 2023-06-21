import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {VIEW_STATE_GE0, VIEW_STATE_IMAGE, VIEW_STATE_STRAT} from './maps.constants';
import {setViewStateGeo, setViewStateImageBasemap, setViewStateStratSection} from './maps.slice';
import useMapsHook from './useMaps';

const useMapView = () => {
  const dispatch = useDispatch();

  const [useMaps] = useMapsHook();

  const viewStateGeo = useSelector(state => state.map.viewStateGeo);
  const viewStateImageBasemap = useSelector(state => state.map.viewStateImageBasemap);
  const viewStateStratSection = useSelector(state => state.map.viewStateStratSection);

  // Set the initial map view states
  const setInitialViewStates = async () => {
    // Set initial geographic map view state
    if (isEmpty(viewStateGeo) || isEmpty(viewStateGeo.longitude) || isEmpty(viewStateGeo.latitude)
      || (isEmpty(viewStateGeo.zoom))) {
      dispatch(setViewStateGeo(VIEW_STATE_GE0));
      try {
        const currentLocation = await useMaps.getCurrentLocation();
        const initialViewState = {...currentLocation, zoom: VIEW_STATE_GE0.zoom};
        dispatch(setViewStateGeo(initialViewState));
      }
      catch (e) {
        console.log('Error getting current location. Using default location.', e);
      }
    }

    // Set initial image basemap view state
    if (isEmpty(viewStateImageBasemap) || isEmpty(viewStateImageBasemap.longitude)
      || isEmpty(viewStateImageBasemap.latitude) || (isEmpty(viewStateImageBasemap.zoom))) {
      dispatch(setViewStateImageBasemap(VIEW_STATE_IMAGE));
    }

    // Set initial strat section view state
    if (isEmpty(viewStateStratSection) || isEmpty(viewStateStratSection.longitude)
      || isEmpty(viewStateStratSection.latitude) || (isEmpty(viewStateStratSection.zoom))) {
      dispatch(setViewStateStratSection(VIEW_STATE_STRAT));
    }
  };

  return {
    setInitialViewStates: setInitialViewStates,
  };
};

export default useMapView;
