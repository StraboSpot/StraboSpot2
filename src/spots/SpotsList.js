import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {notebookReducers} from '../components/notebook-panel/Notebook.constants';
import {settingPanelReducers, SortedViews} from '../components/settings-panel/settingsPanel.constants';
import {isEmpty} from '../shared/Helpers';
import {ListItem} from 'react-native-elements';
import attributesStyles from '../components/settings-panel/settingsPanelSectionStyles/Attributes.styles';
import SortingButtons from '../components/settings-panel/Sorting';

const SpotsList = (props) => {
  const [sortedList, setSortedList] = useState(props.spots);
  const [refresh, setRefresh] = useState(false);
  const {selectedSpot} = props;
  const {spots, sortedListView} = props;

  useEffect(() => {
    console.log('render in SpotList!');
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    setSortedList(spots);
    console.log('render Recent Views in SpotList!');
  }, [selectedSpot, spots, sortedListView, sortedList]);

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

  const renderRecentView = (spotID) => {
    const spot = props.spots.find(spot => {
      return spot.properties.id === spotID;
    });
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
        extraData={refresh}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={true}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>;
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
        extraData={refresh}
        data={props.spots}
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
    imagePaths: state.images.imagePaths,
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedListView: state.settingsPanel.sortedView,
    selectedButtonIndex: state.settingsPanel.selectedButtonIndex,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
  };
};

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotsList);
