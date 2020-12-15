import React, {useState} from 'react';
import {FlatList, View, Text} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import styles from './project.styles';
import useProjectHook from './useProject';

const ActiveDatasetsList = () => {
  const [useProject] = useProjectHook();
  const [refresh] = useState();
  const datasets = useSelector(state => state.project.datasets);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  const renderActiveDatasets = (datasetId, index) => {
    // const getSelectedDataset = datasets[selectedDatasetId];
    const datasetObj = datasets[datasetId];
    // console.log(datasetObj);
    const checked = selectedDatasetId === datasetId;
    return (
      <View>
        {!isEmpty(datasetObj) && (
          <ListItem
            key={datasetObj.id.toString()}
            containerStyle={styles.projectDescriptionListContainer}
            bottomDivider={index < Object.values(activeDatasetsIds).length - 1}
            onPress={() => useProject.makeDatasetCurrent(datasetId)}
          >
            <ListItem.Content>
              <ListItem.Title>{datasetObj.name}</ListItem.Title>
              <ListItem.Subtitle>{datasetObj.spotIds
                ? (
                  <Text
                    style={styles.datasetListItemSpotCount}>
                    ({datasetObj.spotIds.length} spot{datasetObj.spotIds.length !== 1 ? 's' : ''})
                  </Text>
                )
                : <Text style={styles.datasetListItemSpotCount}>(0 spots)</Text>}
              </ListItem.Subtitle>
            </ListItem.Content>
            {checked && <Icon name={'checkmark-outline'} type={'ionicon'} color={BLUE}/>}
          </ListItem>
        )}
      </View>
    );
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={activeDatasetsIds}
        renderItem={({item, index}) => renderActiveDatasets(item, index)}
      />
    </React.Fragment>
  );
};

export default ActiveDatasetsList;
