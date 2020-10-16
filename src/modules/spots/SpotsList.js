import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {connect, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {mainMenuPanelReducers, SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {useTagsHook} from '../tags';
import useSpotsHook from './useSpots';

const SpotsList = (props) => {
  const [sortedList, setSortedList] = useState({});
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj();
  // const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

  useEffect(() => {
    console.log('In SpotsList useEffect: Updating chronological sorting for Spots');
    setSortedList(useSpots.getSpotsSortedReverseChronologically());
  }, [props.spots]);

  const renderDataIcons = (item) => {
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

  const renderName = (item) => {
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
        {renderDataIcons(item)}
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  if (!isEmpty(activeSpotsObj)) {
    let sortedView = null;

    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      if (!isEmpty(props.spotsInMapExtent)) {
        sortedView = <FlatList
          keyExtractor={(item) => item.properties.id.toString()}
          data={props.spotsInMapExtent}
          renderItem={({item}) => renderName(item)}/>;
      }
      else sortedView = <Text style={{padding: 10}}>No Spots in current map extent</Text>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      const recentlyViewedSpotIds = props.recentViews;
      const recentlyViewedSpots = recentlyViewedSpotIds.map(spotId => props.spots[spotId]);
      if (!isEmpty(recentlyViewedSpots)) {
        sortedView = <FlatList
          keyExtractor={(item) => item.properties.id.toString()}
          data={recentlyViewedSpots}
          renderItem={({item}) => renderName(item)}/>;
      }
      else sortedView = <Text style={{padding: 10}}>No recently views Spots</Text>;
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        data={Object.values(activeSpotsObj)}
        renderItem={({item}) => renderName(item)}/>;
    }
    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        <View style={attributesStyles.spotListContainer}>
          {sortedView}
        </View>
      </View>

    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Spots in Active Datasets</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    recentViews: state.spot.recentViews,
    selectedSpot: state.spot.selectedSpot,
    spots: state.spot.spots,
    sortedListView: state.mainMenu.sortedView,
  };
};

const mapDispatchToProps = {
  setSelectedButtonIndex: (index) => ({type: mainMenuPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotsList);
