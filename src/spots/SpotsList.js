import React, {useState, useEffect} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from "react-redux";
import * as SharedUI from '../shared/ui/index';
import {imageReducers} from "../components/images/Image.constants";
import {spotReducers} from "./Spot.constants";
import {homeReducers} from "../views/home/Home.constants";
import {notebookReducers} from "../components/notebook-panel/Notebook.constants";
import {SortedViews} from "../components/settings-panel/settingsPanel.constants";
import {isEmpty} from "../shared/Helpers";
import {Button, ListItem} from "react-native-elements";
import spotListStyles from "../spots/SpotListStyles";

const SpotsList = (props) => {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [sortedList, setSortedList] = useState(props.spots);
  const [refresh, setRefresh] = useState(false);
  const [sortedListView, setSortedListView] = useState(SortedViews.CHRONOLOGICAL);
  const {selectedSpot} = props;
  const {spots} = props;

  useEffect(() => {
    updateIndex(selectedButtonIndex);
    console.log('render in SpotList!')
  }, []);

  useEffect(() => {
    setSortedList(spots);
    setRefresh(!refresh);
    console.log('render Recent Views in SpotList!')
  }, [selectedSpot, spots]);

  const renderName = (item) => {
    return (
      <View style={spotListStyles.spotListListContainer}>
        <ListItem
          key={item.properties.id}
          title={item.properties.name}
          chevron={true}
          onPress={() => props.getSpotData(item.properties.id)}
        />
      </View>
    )
  };

  const renderRecentView = (spotID) => {
    const spot = props.spots.find(spot => {
      return spot.properties.id === spotID
    });
    return (
      <View style={spotListStyles.spotListListContainer}>
        <ListItem
          key={spot.properties.id}
          title={spot.properties.name}
          chevron={true}
          onPress={() => props.getSpotData(spot.properties.id)}
        />
      </View>
    )
  };

  // used with the button group to select active button
  const updateIndex = (selectedButtonIndex) => {
    setSelectedButtonIndex(selectedButtonIndex);
    switch (selectedButtonIndex) {
      case 0:
        console.log('Chronological Selected');
        setSortedListView(SortedViews.CHRONOLOGICAL);
        setSortedList(props.spots.sort(((a, b) => a.properties.date > b.properties.date)));
        setRefresh(!refresh);
        break;
      case 1:
        setSortedListView(SortedViews.MAP_EXTENT);
        break;
      case 2:
        setSortedListView(SortedViews.RECENT_VIEWS);
        break;
    }
  };

  if (!isEmpty(props.spots)) {
    let sortedView = null;

    if (sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>
    }
    else if (sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={sortedList}
        renderItem={({item}) => renderName(item)}/>
    }
    else if (sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView =
        <FlatList
          keyExtractor={(item) => item.toString()}
          extraData={refresh}
          data={props.recentViews}
          inverted={true}
          renderItem={({item}) => renderRecentView(item)}/>
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={props.spots}
        renderItem={({item}) => renderName(item)}/>
    }
    return (
      <React.Fragment>
        <SharedUI.ButtonGroup
          selectedIndex={selectedButtonIndex}
          buttons={['Chronological', 'Map Extent', 'Recent \n Views']}
          containerStyle={{height: 50}}
          buttonStyle={{padding: 5}}
          textStyle={{fontSize: 12}}
          onPress={(selected) => updateIndex(selected)}
        />
        <ScrollView>
          <View style={spotListStyles.spotListListContainer}>
            {sortedView}
          </View>
        </ScrollView>
      </React.Fragment>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    imagePaths: state.images.imagePaths,
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedView: state.images.sortedView,
    selectedButtonIndex: state.settingsPanel.selectedButtonIndex,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  // setSortedListView: (view) => ({type: SET_SORTED_VIEW, view: view}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotsList);
