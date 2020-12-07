import {useEffect} from 'react';
import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import {setCurrentBasemap} from '../maps.slice';


const useMapsOffline = () => {
  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';

  useEffect(() => {

  }, [isOnline]);

  const getMapName = (map) => {
    if (map.id === 'mapbox.outdoors' || map.id === 'mapbox.satellite' || map.id === 'osm'
      || map.id === 'macrostrat' || map.source === 'map_warper') {
      return map.name;
    }
    else return;
  };

  const setOfflineMapTiles = async (map) => {
    let tempCurrentBasemap, tilePath;
    console.log('viewOfflineMap: ', map);
    const url = 'file://' + tileCacheDirectory + '/';

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    if (map.source === 'map_warper') {
       tilePath = 'tiles/{z}_{x}_{y}.png';
    }
    else {
       tilePath = '/tiles/{z}_{x}_{y}.png';
    }

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    dispatch(setCurrentBasemap(tempCurrentBasemap));
  };

  const viewOfflineMap = async () => {
    if (!isEmpty(offlineMaps)) {
      const selectedOfflineMap = offlineMaps[currentBasemap.id];
      if (selectedOfflineMap !== undefined) {
        console.log('SelectedOfflineMap', selectedOfflineMap);
        // Alert.alert('Selected Offline Map', `${JSON.stringify(selectedOfflineMap)}`)
        await setOfflineMapTiles(selectedOfflineMap)
      }
      else {
        const firstAvailableOfflineMap = Object.values(offlineMaps)[0];

        Alert.alert(
          'Not Available',
          'Selected map is not available for offline use.  '
          + `${firstAvailableOfflineMap.name} is available`, [
            {text: 'Use this map', onPress: () => setOfflineMapTiles(firstAvailableOfflineMap), style: 'destructive'},
          ]);
      }
    }
    else if (isEmpty(offlineMaps)) Alert.alert('No Offline Maps Available!');
  };

  return {
    getMapName: getMapName,
    setOfflineMapTiles: setOfflineMapTiles,
    viewOfflineMap: viewOfflineMap,
  };
};

export default useMapsOffline;
