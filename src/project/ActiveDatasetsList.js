import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {projectReducers} from './Project.constants';

const ActiveDatasetsList = () => {
  const [refresh] = useState();
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const dispatch = useDispatch();

  const makeDatasetCurrent = (index) => {
    projectDatasets.map(data => data.current = false);
    const selectedDataset = JSON.parse(JSON.stringify(projectDatasets));
    selectedDataset[index].current = !selectedDataset[index].current;
    console.table(selectedDataset);
    dispatch({type: projectReducers.DATASETS.PROJECT_DATASETS, datasets: selectedDataset});
  };

  const renderActiveDatasets = ({item, index}) => {
    if (item.active) {
      return (
        <ListItem
          key={item.id}
          title={item.name}
          containerStyle={{padding: 10}}
          bottomDivider
          checkmark={projectDatasets[index].current}
          onPress={() => makeDatasetCurrent(index)}
        />
      );
    }
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item, i) => item.id.toString()}
        extraData={refresh}
        data={projectDatasets}
        renderItem={renderActiveDatasets}
      />
    </React.Fragment>
  );
};

export default ActiveDatasetsList;
