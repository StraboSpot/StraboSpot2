import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {useTagsHook} from '../tags';
import useSpotsHook from './useSpots';

const SpotsList = (props) => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);

  const renderNoSpotsText = () => {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Spots in Active Datasets</Text>
      </View>
    );
  };

  const renderSpot = (spot) => {
    const tags = useTags.getTagsAtSpot(spot.properties.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return (
      <ListItem
        key={spot.properties.id}
        onPress={() => props.openSpotInNotebook(spot)}
      >
        <Avatar source={useSpots.getSpotGemometryIconSource(spot)}
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}/>
        <ListItem.Content>
          <ListItem.Title>{spot.properties.name}</ListItem.Title>
          {!isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>}
        </ListItem.Content>
        {renderSpotDataIcons(spot)}
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSpotDataIcons = (spot) => {
    const keysFound = useSpots.getSpotDataKeys(spot);
    if (!isEmpty(useTags.getTagsAtSpot(spot.properties.id))) keysFound.push('tags');
    return (
      <React.Fragment>
        {keysFound.map(key => {
          return (
            <Avatar
              source={useSpots.getSpotDataIconSource(key)}
              placeholderStyle={{backgroundColor: 'transparent'}}
              size={20}
            />
          );
        })}
      </React.Fragment>
    );
  };

  const renderSpotsList = () => {
    let sortedSpots = useSpots.getSpotsSortedReverseChronologically();
    let noSpotsText = 'No Spots';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpots = props.spotsInMapExtent;
      if (isEmpty(sortedSpots)) noSpotsText = 'No Spots in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      sortedSpots = recentViews.map(spotId => spots[spotId]);
      if (isEmpty(sortedSpots)) noSpotsText = 'No recently viewed Spots';
    }
    return (
      <React.Fragment>
        <View style={{flex: 1}}>
          <SortingButtons/>
          <View style={attributesStyles.spotListContainer}>
            {isEmpty(sortedSpots)
              ? <Text style={{padding: 10}}>{noSpotsText}</Text>
              : (
                <FlatList
                  keyExtractor={(spot) => spot.properties.id.toString()}
                  data={sortedSpots}
                  renderItem={({item}) => renderSpot(item)}
                />
              )
            }
          </View>
        </View>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getActiveSpotsObj()) ? renderNoSpotsText() : renderSpotsList()}
    </React.Fragment>
  );
};

export default SpotsList;
