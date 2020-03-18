import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';
import useProjectHook from './useProject';

// Styles
import styles from './project.styles';

const ActiveDatasetsList = () => {
  const [useProject] = useProjectHook();
  const [refresh] = useState();
  const datasets = useSelector(state => state.project.datasets);

  const renderActiveDatasets = ({item}) => {
    if (item.active) {
      return (
        <ListItem
          key={item.id}
          title={item.name}
          containerStyle={styles.listItems}
          bottomDivider
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
