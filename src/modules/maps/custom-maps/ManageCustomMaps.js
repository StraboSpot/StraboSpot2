import React from 'react';
import {FlatList} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import useCustomMapHook from './useCustomMap';
import commonStyles from '../../../shared/common.styles';
import {PRIMARY_ACCENT_COLOR} from '../../../shared/styles.constants';
import AddButton from '../../../shared/ui/AddButton';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import SectionDivider from '../../../shared/ui/SectionDivider';
import useMapHook from '../useMap';

const ManageCustomMaps = ({zoomToCustomMap}) => {
  console.log('Rendering ManageCustomMaps...');

  const customMaps = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.connections.isOnline);

  const useCustomMap = useCustomMapHook();
  const useMap = useMapHook();

  const {isInternetReachable, isConnected} = isOnline;

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
        onPress={() => useCustomMap.getCustomMapDetails(item)}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
          <ListItem.Subtitle>({mapTypeName(item.source)} - {item.id})</ListItem.Subtitle>
        </ListItem.Content>
        {(item.source === 'mapbox_styles' || item.source === 'strabospot_mymaps') && (
          <Icon
            disabled={!isInternetReachable && !isConnected}
            disabledStyle={{backgroundColor: 'transparent'}}
            name={(isInternetReachable && isConnected) || !isInternetReachable && isConnected ? 'map-outline'
              : !isInternetReachable && !isConnected ? 'cloud-offline' : null}
            type={'ionicon'}
            color={PRIMARY_ACCENT_COLOR}
            onPress={async () => {
              let customMapWithBbox;
              if (item.overlay) customMapWithBbox = await useCustomMap.saveCustomMap({...item, isViewable: true});
              else customMapWithBbox = await useMap.setBasemap(item.id);
              customMapWithBbox.bbox && setTimeout(() => zoomToCustomMap(customMapWithBbox.bbox), 1000);
            }}
          />
        )}
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <>
      <AddButton
        onPress={() => useCustomMap.getCustomMapDetails({})}
        title={'Add New Custom Map'}
        type={'outline'}
      />
      <SectionDivider dividerText={'Current Custom Maps'}/>
      <FlatList
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        data={Object.values(customMaps)}
        renderItem={({item}) => renderCustomMapListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Custom Maps'}/>}
      />
    </>
  );
};

export default ManageCustomMaps;
