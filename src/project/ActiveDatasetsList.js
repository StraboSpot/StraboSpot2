import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {projectReducers} from './Project.constants';

const ActiveDatasetsList = () => {
  const [refresh] = useState();
  const datasets = useSelector(state => state.project.datasets);
  const dispatch = useDispatch();

  const makeDatasetCurrent = (id) => {
    Object.values(datasets).map(data => data.current = false);
    const datasetsCopy = JSON.parse(JSON.stringify(datasets));
    datasetsCopy[id].current = !datasetsCopy[id].current;
    dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
  };

  const renderActiveDatasets = ({item}) => {
    if (item.active) {
      return (
        <ListItem
          key={item.id}
          title={item.name}
          containerStyle={{padding: 10}}
          bottomDivider
          checkmark={item.current}
          onPress={() => makeDatasetCurrent(item.id)}
        />
      );
    }
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item) => item.id.toString()}
        extraData={refresh}
        data={Object.values(datasets)}
        renderItem={renderActiveDatasets}
      />
    </React.Fragment>
  );
};

export default ActiveDatasetsList;
