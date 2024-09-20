import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import useProject from './useProject';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';

const ActiveDatasetsList = () => {
  const {makeDatasetCurrent} = useProject();

  const [refresh] = useState();

  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  const renderActiveDatasets = (datasetId) => {
    const datasetObj = datasets[datasetId];
    const checked = selectedDatasetId && selectedDatasetId === datasetId;
    if (!isEmpty(datasetObj)) {
      return (
        <ListItem
          key={datasetObj.id.toString()}
          containerStyle={commonStyles.listItem}
          onPress={() => makeDatasetCurrent(datasetId)}
        >
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{datasetObj.name}</ListItem.Title>
            <ListItem.Subtitle style={commonStyles.listItemSubtitle}>
              {datasetObj.spotIds
                ? `(${datasetObj.spotIds.length} spot${datasetObj.spotIds.length !== 1 ? 's' : ''})`
                : '(0 spots)'}
            </ListItem.Subtitle>
          </ListItem.Content>
          {checked && <Icon name={'checkmark-outline'} type={'ionicon'} color={BLUE}/>}
        </ListItem>
      );
    }
  };

  return (
    <FlatList
      keyExtractor={item => item.toString()}
      extraData={refresh}
      data={activeDatasetsIds}
      renderItem={({item}) => renderActiveDatasets(item)}
      ItemSeparatorComponent={FlatListItemSeparator}
    />
  );
};

export default ActiveDatasetsList;
