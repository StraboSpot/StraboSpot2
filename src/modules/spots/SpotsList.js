import React from 'react';
import {FlatList, View} from 'react-native';

import {useSelector} from 'react-redux';

import {SpotsListItem, useSpotsHook} from './index';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import UpdateSpotsInMapExtentButton from '../../shared/ui/UpdateSpotsInMapExtentButton';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';

const SpotsList = ({isCheckedList, onPress, updateSpotsInMapExtent}) => {
  console.log('Rendering SpotsList...');

  const useSpots = useSpotsHook();

  const sortedView = useSelector(state => state.mainMenu.sortedView);

  let sortedSpots = useSpots.getSpotsSortedReverseChronologically();

  const renderNoSpotsText = () => {
    return <ListEmptyText text={'No Spots in Active Datasets'}/>;
  };

  const renderSpotsList = () => {
    console.log('Rendering Spots List...');
    let noSpotsText = 'No Spots';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpots = useSpots.getSpotsInMapExtent();
      if (isEmpty(sortedSpots)) noSpotsText = 'No active Spots in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      sortedSpots = useSpots.getRecentSpots();
      if (isEmpty(sortedSpots)) noSpotsText = 'No recently viewed active Spots';
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
        <SectionDivider dividerText={sortedSpots.length + ' Active ' + (sortedSpots.length === 1 ? 'Spot' : 'Spots')}/>
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
