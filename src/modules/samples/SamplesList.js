import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import IGSNDisplay from './IGSNDisplay';
import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const SamplesList = ({onPress, page, openModal}) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedItem, setSelectedItem] = useState(null);

  const samples = spot?.properties?.samples || [];
  const renderSamplesListItem = (item) => {
    let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';
    return (
      <>
        <ListItem
          containerStyle={commonStyles.listItem}
          key={item.id}
          onPress={() => onPress(item)}
          pad={5}
        >
          <IGSNDisplay item={item} openModal={openModal}/>
          <ListItem.Content>
            <ListItem.Title titleStyle={{
              ...commonStyles.listItemTitle,
              textAlign: 'left',
            }}>{item.sample_id_name || 'Unknown'}</ListItem.Title>
            <ListItem.Subtitle>
              {oriented} - {item.sample_description ? truncateText(item.sample_description, 35) : 'No Description'}
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      </>
    );
  };

  return (
    <>
      <FlatList
        keyExtractor={item => item.id}
        data={samples.slice().sort(
          (a, b) => (a.sample_id_name || 'Unknown').localeCompare((b.sample_id_name || 'Unknown')))}
        renderItem={({item}) => renderSamplesListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Samples'}/>}
      />
    </>
  );
};

export default SamplesList;
