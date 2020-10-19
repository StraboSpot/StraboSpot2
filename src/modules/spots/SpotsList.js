import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
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

  const renderSpot = (item) => {
    const tags = useTags.getTagsAtSpot(item.properties.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return (
      <ListItem
        key={item.properties.id}
        onPress={() => props.getSpotData(item.properties.id)}
      >
        <Avatar source={useSpots.getSpotGemometryIconSource(item)} size={20}/>
        <ListItem.Content>
          <ListItem.Title>{item.properties.name}</ListItem.Title>
          {!isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>}
        </ListItem.Content>
        {renderSpotDataIcons(item)}
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSpotDataIcons = (item) => {
    const keysFound = useSpots.getSpotDataKeys(item);
    if (!isEmpty(useTags.getTagsAtSpot(item.properties.id))) keysFound.push('tags');
    return (
      <React.Fragment>
        {keysFound.map(key => {
          return <Avatar
            source={useSpots.getSpotDataIconSource(key)}
            size={20}
            key={key}
            title={key}  // used as placeholder while loading image
          />;
        })}
      </React.Fragment>
    );
  };

  const renderSpotsList = () => {
    let sortedSpots = useSpots.getSpotsSortedReverseChronologically();
    let noSpotsText = 'No Spots';
    if (sortedView === SortedViews.MAP_EXTENT) {
      sortedSpots = props.spotsInMapExtent;
      if (isEmpty(sortedSpots)) noSpotsText = 'No Spots in current map extent';
    }
    else if (sortedView === SortedViews.RECENT_VIEWS) {
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
                  keyExtractor={(item) => item.properties.id.toString()}
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
