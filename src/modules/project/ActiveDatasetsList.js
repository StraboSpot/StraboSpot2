import React, {useState} from 'react';
import {FlatList, View, Text} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {BLUE} from '../../shared/styles.constants';
import styles from './project.styles';
import useProjectHook from './useProject';

const ActiveDatasetsList = () => {
  const [useProject] = useProjectHook();
  const [refresh] = useState();
  const datasets = useSelector(state => state.project.datasets);

  const renderActiveDatasets = ({item, index}) => {
    if (item.active) {
      return (
        <ListItem
          key={item.id}
          containerStyle={styles.projectDescriptionListContainer}
          bottomDivider={index < Object.values(datasets).length - 1}
          onPress={() => useProject.makeDatasetCurrent(item.id)}
        >
          <ListItem.Content>
            <ListItem.Title>{item.name}</ListItem.Title>
            <ListItem.Subtitle>{item.spotIds ? <Text
                style={styles.datasetListItemSpotCount}>({item.spotIds.length} spot{item.spotIds.length !== 1 ? 's' : ''})</Text>
              : <Text style={styles.datasetListItemSpotCount}>(0 spots)</Text>}</ListItem.Subtitle>
          </ListItem.Content>
          {item.current && <Icon name={'checkmark-outline'} type={'ionicon'} color={BLUE}/>}
        </ListItem>
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
