import React from 'react';
import {FlatList} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const SamplesList = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const samples = spot?.properties?.samples || [];

  const renderSamplesListItem = (item) => {
    let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={item.id}
        onPress={() => props.onPress(item)}
        pad={5}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.sample_id_name || 'Unknown'}</ListItem.Title>
          <ListItem.Subtitle>
            {oriented} - {item.sample_description ? item.sample_description : 'No Description'}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <FlatList
      data={samples}
      renderItem={({item}) => renderSamplesListItem(item)}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No Samples'}/>}
    />
  );
};

export default SamplesList;
