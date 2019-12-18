import React, {useState} from 'react';
import {Switch, ScrollView, Text, View, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import {projectReducers} from './Project.constants';
import useServerRequests from '../services/useServerRequests';
import {isEmpty} from '../shared/Helpers';
import {spotReducers} from '../spots/Spot.constants';
import Loading from '../shared/ui/Loading';

const DatasetList = () => {
  const [serverRequests] = useServerRequests();
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
        dispatch({type: spotReducers.SPOTS_ADD, spots: spots});
        const spotIds = Object.values(spots).map(spot => spot.properties.id);
        dispatch({type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET, datasetId: dataset.id, spotIds: spotIds});
      }
    }
    else {
      setLoading(false);
    }
  };

  const getIsDisabled = (id)=> {
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    return activeDatasets.length === 1 && activeDatasets[0].id === id;
  };

  const initializeDownloadDataset = async (dataset) => {
    const datasetInfo = await serverRequests.getDataset(dataset.id, userData.encoded_login);
    console.log(datasetInfo);
  };

  const spotsQuantitiesInDataset = () => {
    console.log(datasets.length)

  };

  const renderDatasets = () => {
    if (!isEmpty(datasets)) {
      return (
        <ScrollView>
          {Object.values(datasets).map( (item)=> {
            return <ListItem
              key={item.id}
              title={item.name}
              containerStyle={{padding: 5}}
              bottomDivider
              rightElement={
                <Switch
                  onValueChange={(value) => setSwitchValue(value, item.id)}
                  value={item.active}
                  disabled={getIsDisabled(item.id)}
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
