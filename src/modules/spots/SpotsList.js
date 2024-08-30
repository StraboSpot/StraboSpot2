import React from 'react';
import {FlatList, View} from 'react-native';

import {useSelector} from 'react-redux';

import {SpotsListItem, useSpotsHook} from './index';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import UpdateSpotsInMapExtentButton from '../../shared/ui/UpdateSpotsInMapExtentButton';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';

const SpotsList = ({isCheckedList, onPress, updateSpotsInMapExtent}) => {
  console.log('Rendering SpotsList...');

  const useSpots = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

  let sortedSpots = useSpots.getSpotsSortedReverseChronologically();

  const renderNoSpotsText = () => {
    return <ListEmptyText text={'No Spots in Active Datasets'}/>;
  };

  const renderSpotsList = () => {
    console.log('Rendering Spots List...');
    let noSpotsText = 'No Spots';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpots = spotsInMapExtent;
      if (isEmpty(sortedSpots)) noSpotsText = 'No Spots in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      sortedSpots = recentViews.map(spotId => spots[spotId]);
      if (isEmpty(sortedSpots)) noSpotsText = 'No recently viewed Spots';
    }
    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        {sortedView === SORTED_VIEWS.MAP_EXTENT && (
          <UpdateSpotsInMapExtentButton
            title={'Update Spots in Map Extent'}
            updateSpotsInMapExtent={updateSpotsInMapExtent}
          />
        )}
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={spot => spot.properties.id.toString()}
            data={sortedSpots}
            renderItem={({item}) => (
              <SpotsListItem
                doShowTags={true}
                isCheckedList={isCheckedList}
                onPress={onPress}
                spot={item}
              />
            )}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={noSpotsText}/>}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {isEmpty(sortedSpots) ? renderNoSpotsText() : renderSpotsList()}
    </>
  );
};

export default SpotsList;
