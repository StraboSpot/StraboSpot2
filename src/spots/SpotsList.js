import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';
import {connect} from 'react-redux';

import {isEmpty} from '../shared/Helpers';
import {ListItem} from 'react-native-elements';
import {settingPanelReducers, SortedViews} from '../components/settings-panel/settingsPanel.constants';
import SortingButtons from '../components/settings-panel/SortingButtons';

import attributesStyles from '../components/settings-panel/settingsPanelSectionStyles/Attributes.styles';

const SpotsList = (props) => {
  const [sortedList, setSortedList] = useState(getSpotsSortedChronologically);

  useEffect(() => {
    console.log('In SpotsList useEffect: Updating chronological sorting for Spots');
    setSortedList(getSpotsSortedChronologically);
  }, [props.spots]);

  // Reverse chronologically sort Spots
  const getSpotsSortedChronologically = () => {
    return Object.values(props.spots).sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  const renderName = (item) => {
    return (
      <View>
        <ListItem
          key={item.properties.id}
          title={item.properties.name}
          chevron={true}
          onPress={() => props.getSpotData(item.properties.id)}
        />
      </View>
    );
  };

  const renderRecentView = (spotId) => {
    const spot = props.spots[spotId];
    return (
      <View>
        <ListItem
          key={spot.properties.id}
          title={spot.properties.name}
          chevron={true}
          onPress={() => props.getSpotData(spot.properties.id)}
        />
      </View>
    );
  };

  if (!isEmpty(props.spots)) {
    let sortedView = null;

    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <View style={attributesStyles.textContainer}>
        <Text>Not Implemented Yet</Text>
      </View>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView =
        <FlatList
          keyExtractor={(item) => item.toString()}
          data={props.recentViews}
          renderItem={({item}) => renderRecentView(item)}/>;
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        data={Object.values(props.spots)}
        renderItem={({item}) => renderName(item)}/>;
    }
    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        <View style={attributesStyles.spotsListContainer}>
          {sortedView}
        </View>
      </View>

    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Spots Found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    recentViews: state.spot.recentViews,
    selectedSpot: state.spot.selectedSpot,
    spots: state.spot.spots,
    sortedListView: state.settingsPanel.sortedView,
  };
};

const mapDispatchToProps = {
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotsList);
