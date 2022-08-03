import React, {useEffect} from 'react';
import {FlatList} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {PRIMARY_ACCENT_COLOR} from '../../../shared/styles.constants';
import AddButton from '../../../shared/ui/AddButton';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import SectionDivider from '../../../shared/ui/SectionDivider';
import useMapHook from '../useMaps';

const ManageCustomMaps = (props) => {
  const customMaps = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const [useMaps] = useMapHook();

  useEffect(() => {
    console.log('UE ManageCustomMaps [isOnline]', isOnline);
  }, [isOnline]);

  const mapTypeName = (source) => {
    let name;
    if (source === 'mapbox_styles') name = 'Mapbox Styles';
    if (source === 'map_warper') name = 'Map Warper';
    if (source === 'strabospot_mymaps') name = 'Strabospot My Maps';
    return name;
  };

  const renderCustomMapListItem = (item) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={item.id}
        onPress={() => useMaps.customMapDetails(item)}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
          <ListItem.Subtitle>({mapTypeName(item.source)} - {item.id})</ListItem.Subtitle>
        </ListItem.Content>
        <Icon
          disabled={!isOnline.isInternetReachable}
          disabledStyle={{backgroundColor: 'transparent'}}
          name={isOnline.isInternetReachable ? 'map-outline' : 'cloud-offline'}
          type={'ionicon'}
          color={PRIMARY_ACCENT_COLOR}
          onPress={async () => {
            const baseMap = await useMaps.setBasemap(item.id);
            baseMap.bbox && setTimeout(() => props.zoomToCustomMap(baseMap.bbox), 1000);
          }}
        />
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <AddButton
        onPress={() => useMaps.customMapDetails({})}
        title={'Add new Custom Map'}
        type={'outline'}
      />
      <SectionDivider dividerText={'Current Custom Maps'}/>
      <FlatList
        keyExtractor={item => item.toString()}
        data={Object.values(customMaps)}
        renderItem={({item}) => renderCustomMapListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Custom Maps'}/>}
      />
    </React.Fragment>
  );
};

export default ManageCustomMaps;
