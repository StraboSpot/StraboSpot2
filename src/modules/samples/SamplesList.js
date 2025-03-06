import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {Button, Image, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import IGSNModal from './IGSNModal';
import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const SamplesList = ({onPress, page}) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isIGSNModalVisible, setIsIGSNModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const samples = spot?.properties?.samples || [];

  const openModal = (item) => {
    setSelectedItem(item);
    setIsIGSNModalVisible(true);
  };

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
          {<Button
            icon={<Image
              source={require('../../assets/images/logos/IGSN_Logo_200.jpg')}
              style={{width: 20, height: 20}}
            />}
            containerStyle={commonStyles.buttonContainer}
            // buttonStyle={{backgroundColor: 'rgb(164, 200, 209)', borderRadius: 10, borderWidth: 1}}
            // type={'clear'}
            onPress={() => openModal(item)}
          />}
          <ListItem.Content style={{flexDirection: 'column'}}>
            <ListItem.Title titleStyle={{
              ...commonStyles.listItemTitle,
              textAlign: 'left',
            }}>{item.sample_id_name || 'Unknown'}</ListItem.Title>
            <ListItem.Subtitle>
              {oriented} - {item.sample_description ? item.sample_description : 'No Description'}
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
      {isIGSNModalVisible && (
        <IGSNModal
          onModalCancel={() => setIsIGSNModalVisible(false)}
          sampleValues={selectedItem}
          // selectedFeature={selectedFeature}
        />
      )}
    </>
  );
};

export default SamplesList;
