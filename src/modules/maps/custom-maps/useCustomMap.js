import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/urls.constants';
import useServerRequests from '../../../services/useServerRequests';
import {isEmpty} from '../../../shared/Helpers';
import {addedStatusMessage, clearedStatusMessages, setIsWarningMessagesModalVisible} from '../../home/home.slice';
import {SIDE_PANEL_VIEWS} from '../../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../../main-menu-panel/mainMenuPanel.slice';
import {addedProject, updatedProject} from '../../project/projects.slice';
import {MAP_PROVIDERS} from '../maps.constants';
import {
  addedCustomMap,
  deletedCustomMap,
  selectedCustomMapToEdit,
  setCurrentBasemap,
  updateCustomMap,
} from '../maps.slice';
import useMap from '../useMap';
import useMapCoords from '../useMapCoords';
import useMapURLHook from '../useMapURL';

const useCustomMap = () => {
  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customDatabaseEndpoint = useSelector(state => state.connections.databaseEndpoint);
  const customMaps = useSelector(state => state.map.customMaps);
  const project = useSelector(state => state.project.project);

  const {setBasemap} = useMap();
  const {getMyMapsBboxCoords} = useMapCoords();
  const useMapURL = useMapURLHook();
  const {testCustomMapUrl} = useServerRequests();

  const deleteMap = async (mapId) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapId);
    const projectCopy = {...project};
    const customMapsCopy = {...customMaps};
    delete customMapsCopy[mapId];
    if (projectCopy.other_maps) {
      const filteredCustomMaps = projectCopy.other_maps.filter(map => map.id !== mapId);
      dispatch(addedProject({...projectCopy, other_maps: filteredCustomMaps})); // Deletes map from project
    }
    dispatch(deletedCustomMap(customMapsCopy)); // replaces customMaps with updated object
    dispatch(setSidePanelVisible({view: null, bool: false}));
  };

  const getCustomMapDetails = (map) => {
    if (map.source === 'map_warper') {
      const warningMessage = 'Map Warper maps are no longer available. Download the .tiff'
        + ' file from Mapwarper.net and upload it into your Strabo MyMaps account.';
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(warningMessage));
      dispatch(setIsWarningMessagesModalVisible(true));
    }
    dispatch(selectedCustomMapToEdit(map));
    dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP, bool: true}));
  };

  const getProviderInfo = (source) => {
    let providerInfo = {...MAP_PROVIDERS[source]};
    if (customDatabaseEndpoint.isSelected) {
      const serverUrl = customDatabaseEndpoint.url;
      const lastOccur = serverUrl.lastIndexOf('/');
      providerInfo.url = [serverUrl.substring(0, lastOccur) + '/geotiff/tiles/'];
      return providerInfo;
    }
    console.log(providerInfo);
    return providerInfo;
  };

  const saveCustomMap = async (map) => {
    let mapId = map.id.trim();
    let customMap;
    const providerInfo = getProviderInfo(map.source);
    let bbox = '';
    // Pull out mapbox styles map id
    if (map.source === 'mapbox_styles' && map.id.includes('mapbox://styles/')) {
      mapId = map.id.split('/').slice(3).join('/');
    }
    customMap = {...map, ...providerInfo, id: mapId, source: map.source};
    const tileUrl = useMapURL.buildTileURL(customMap);
    let testTileUrl = tileUrl.replace(/({z}\/{x}\/{y})/, '0/0/0');
    if (map.source === 'strabospot_mymaps') {
      if (!isEmpty(customDatabaseEndpoint.url) && customDatabaseEndpoint.isSelected) {
        const customEndpointTest = customDatabaseEndpoint.url.replace('/db', '/strabo_mymaps_check/');
        testTileUrl = customEndpointTest + map.id;
      }
      else testTileUrl = STRABO_APIS.MY_MAPS_CHECK + map.id;

    }
    console.log('Custom Map:', customMap, 'Test Tile URL:', testTileUrl);

    const testUrlResponse = await testCustomMapUrl(testTileUrl);
    console.log('RES', testUrlResponse);
    if (testUrlResponse) {
      bbox = await getMyMapsBboxCoords(map);
      if (map.overlay && map.id === currentBasemap.id) {
        console.log(('Setting Basemap to Mapbox Topo...'));
        await setBasemap(null);
      }
      if (project.other_maps) {
        const otherMapsInProject = project.other_maps;
        const otherMapsInProjectFiltered = otherMapsInProject.filter(m => m.id !== customMap.id);
        // if (customMap.source !== 'mapbox_styles') delete customMap.key;
        dispatch(updatedProject(
          {field: 'other_maps', value: [...otherMapsInProjectFiltered, customMap]}));
      }
      else dispatch(updatedProject({field: 'other_maps', value: [map]}));
      dispatch(addedCustomMap(bbox ? {...customMap, bbox: bbox} : customMap));
      return customMap;
    }
    else throw (`${customMap.id} is not a valid ID for this map.  Please check the id and try again.`);
  };

  const setCustomMapSwitchValue = (value, map) => {
    console.log('Custom Map Switch Value:', value, 'Map Id:', map.id);
    if (customMaps[map.id]) {
      dispatch(addedCustomMap({...customMaps[map.id], isViewable: value}));
      if (!customMaps[map.id].overlay) viewCustomMap(map);
    }
  };

  const updateMap = (map) => {
    const customMapsCopy = {...customMaps};
    customMapsCopy[map.id] = map;
    console.log(customMapsCopy);
    dispatch(updateCustomMap(map));
    dispatch(addedProject({...project, other_maps: Object.values(customMapsCopy)}));
  };

  const viewCustomMap = (map) => {
    console.log('Setting current basemap to a custom basemap...');
    dispatch(setCurrentBasemap(map));
  };

  return {
    deleteMap: deleteMap,
    getCustomMapDetails: getCustomMapDetails,
    saveCustomMap: saveCustomMap,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    updateMap: updateMap,
  };
};

export default useCustomMap;
