import React, {useState} from 'react';
import {Switch, ScrollView, Text, View, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import {projectReducers} from './Project.constants';
import {isEmpty} from '../shared/Helpers';
import {spotReducers} from '../spots/Spot.constants';
import Loading from '../shared/ui/Loading';

// Hooks
import useServerRequests from '../services/useServerRequests';
import useImagesHook from '../components/images/useImages';


const DatasetList = () => {
  const [serverRequests] = useServerRequests();
  const [useImages] = useImagesHook();
  const [loading, setLoading] = useState(false);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();

  const downloadSpots = async (dataset) => {
    const datasetInfoFromServer = await serverRequests.getDatasetSpots(dataset.id, userData.encoded_login);
    if (!isEmpty(datasetInfoFromServer) && datasetInfoFromServer.features) {
      const spots = datasetInfoFromServer.features;
      setLoading(false);
      if (!isEmpty(datasetInfoFromServer) && spots) {
        console.log(spots);
        dispatch({type: spotReducers.ADD_SPOTS, spots: spots});
        const spotIds = Object.values(spots).map(spot => spot.properties.id);
        dispatch({type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET, datasetId: dataset.id, spotIds: spotIds});
        const neededImagesIds = await gatherNeededImages(spots);
        console.table(neededImagesIds);
        await downloadImages(neededImagesIds);
      }
    }
    else {
      setLoading(false);
    }
  };

  const gatherNeededImages = async (spots) => {
    let neededImagesIds = [];
    const promises = [];
    spots.map(spot => {
      if (spot.properties.images) {
        spot.properties.images.map((image) => {
          const promise = useImages.doesImageExist(image.id).then((exists) => {
            if (!exists) {
              console.log('Need to download image', image.id);
              neededImagesIds.push(image.id);
            }
            else console.log('Image', image.id, 'already exists on device. Not downloading.');
          });
          promises.push(promise);
        });
      }
    });
    return Promise.all(promises).then(() => {
      Alert.alert(`Images needed to download: ${neededImagesIds.length}`);
      return Promise.resolve(neededImagesIds);
    });
  };

  const downloadImages = neededImageIds => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;

    neededImageIds.map(imageId => {
      let promise = downloadImage(imageId).then(() => {
        imagesDownloadedCount++;
        savedImagesCount++;
        console.log(
          'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length +
          ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
      }, err => {
        imagesFailedCount++;
        console.warn('Error downloading Image', imageId, 'Error:', err);
      });
      promises.push(promise);
    });
    return Promise.all(promises).then(() => {
      if (imagesFailedCount > 0) {
        //downloadErrors = true;
        console.warn('Image Downloads Failed: ' + imagesFailedCount);
      }
    });
  };

  const downloadImage = imageId => {
    console.log('Download image', imageId);
    return Promise.resolve();
    //return serverRequests.downloadImage(imageId, userData.encoded_login).then(() => {

    //});
  };

  const isDisabled = (id) => {
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    return activeDatasets.length === 1 && activeDatasets[0].id === id;
  };

  const initializeDownloadDataset = async (dataset) => {
    const datasetInfo = await serverRequests.getDataset(dataset.id, userData.encoded_login);
    console.log(datasetInfo);
  };

  const spotsQuantitiesInDataset = () => {
    console.log(datasets.length);

  };

  const renderDatasets = () => {
    if (!isEmpty(datasets)) {
      return (
        <ScrollView>
          {Object.values(datasets).map((item) => {
            return <ListItem
              key={item.id}
              title={item.name}
              containerStyle={{padding: 5}}
              bottomDivider
              rightElement={
                <Switch
                  onValueChange={(value) => setSwitchValue(value, item.id)}
                  value={item.active}
                  disabled={isDisabled(item.id)}
                />}
            />;
          })}
        </ScrollView>);
    }
  };

  const setSwitchValue = async (val, id) => {
    const datasetsCopy = {...datasets};
    datasetsCopy[id].active = val;

    // Check for a current dataset
    const i = Object.values(datasetsCopy).findIndex(data => data.current === true);
    if (val && i === -1) datasetsCopy[id].current = true;

    else if (!val && datasetsCopy[id].current) {
      datasetsCopy[id].current = false;
      const datasetsActive = Object.values(datasetsCopy).filter(dataset => dataset.active === true);
      datasetsCopy[datasetsActive[0].id].current = true;
    }
    if (isOnline && !isEmpty(userData) && !isEmpty(datasetsCopy[id]) && datasetsCopy[id].active) {
      // dispatch({type: homeReducers.SET_LOADING, bool: true});
      setLoading(true);
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
      await downloadSpots(datasets[id]);
    }
    else {
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
    }
  };

  return (
    <View style={{flex: 1}}>
      {renderDatasets()}
      {loading && <Loading style={{backgroundColor: 'transparent'}}/>}
    </View>
  );
};

export default DatasetList;
