import React, {useState} from 'react';
import {FlatList, View, Text} from 'react-native';
import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';
import useProjectHook from './useProject';

// Styles
import styles from './project.styles';

const ActiveDatasetsList = () => {
  const [useProject] = useProjectHook();
  const [refresh] = useState();
  const datasets = useSelector(state => state.project.datasets);

  const spotLengthText = (item) => {
      return (
        <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
          <Text style={styles.datasetListItemText}>{item.name} </Text>
         {item.spotIds ? <Text style={styles.datasetListItemSpotCount}>({item.spotIds.length} spot{item.spotIds.length !== 1 ? 's' : '' })</Text>
           : <Text style={styles.datasetListItemSpotCount}>(0 spots)</Text>}
        </View>
      );
  };

  const renderActiveDatasets = ({item, index}) => {
    if (item.active) {
      return (
        <ListItem
          key={item.id}
          title={spotLengthText(item)}
          containerStyle={styles.projectDescriptionListContainer}
          bottomDivider={index < Object.values(datasets).length - 1}
          checkmark={item.current}
          onPress={() => useProject.makeDatasetCurrent(item.id)}
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
