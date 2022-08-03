import React from 'react';
import {FlatList, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {SpotsListItem, useSpotsHook} from './index';

const SpotsList = (props) => {
  const [useSpots] = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

  const renderNoSpotsText = () => {
    return <ListEmptyText text={'No Spots in Active Datasets'}/>;
  };

  const renderSpotsList = () => {
    let sortedSpots = useSpots.getSpotsSortedReverseChronologically();
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
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={spot => spot.properties.id.toString()}
            data={sortedSpots}
            renderItem={({item}) => (
              <SpotsListItem
                doShowTags={true}
                isCheckedList={props.isCheckedList}
                onPress={props.onPress}
                spot={item}
              />)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={noSpotsText}/>}
          />
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getActiveSpotsObj()) ? renderNoSpotsText() : renderSpotsList()}
    </React.Fragment>
  );
};

export default SpotsList;
