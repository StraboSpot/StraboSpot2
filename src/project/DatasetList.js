import React, {useState} from 'react';
import {Switch, ScrollView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import {projectReducers} from './Project.constants';
import * as RemoteServer from '../services/useServerRequests';
import Loading from '../shared/ui/Loading';

import {isEmpty} from '../shared/Helpers';
import {spotReducers} from '../spots/Spot.constants';

const DatasetList = () => {
  const [loading, setLoading] = useState(false);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user.userData);
  const dispatch = useDispatch();

  const downloadSpots = async (dataset) => {
    const datasetInfoFromServer = await RemoteServer.getDatasetSpots(dataset.id, userData.encoded_login);
    const spots = datasetInfoFromServer.features;
    setLoading(false);
    if (!isEmpty(datasetInfoFromServer) && spots) {
      console.log(spots);
      dispatch({type: spotReducers.SPOTS_ADD, spots: spots});
      const spotIds = Object.values(spots).map(spot => spot.properties.id);
      dispatch({type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET, datasetId: dataset.id, spotIds: spotIds});
    }
  };

  const initializeDownloadDataset = async (dataset) => {
    const datasetInfo = await RemoteServer.getDataset(dataset.id, userData.encoded_login)
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
                  disabled={item.current}
                />}
            />;
          })}
        </ScrollView>);
    }
  };

  const setSwitchValue = async (val, id) => {
    const datasetsToggled = JSON.parse(JSON.stringify(datasets));
    const i = Object.values(datasets).findIndex(data => data.current === true);
    if (i === -1) datasetsToggled[id].current = true;
    datasetsToggled[id].active = val;
    if (isOnline && !isEmpty(userData) && !isEmpty(datasetsToggled[id]) && datasetsToggled[id].active) {
      setLoading(true);
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsToggled});
      await downloadSpots(datasetsToggled[id]);
    }
    else {
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsToggled});
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
