import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
// import {Text, View, FlatList, ScrollView, ActivityIndicator} from 'react-native';
import {SortedViews} from "./settingsPanel.constants";
import * as SharedUI from "../../shared/ui";
import {imageReducers} from "../images/Image.constants";
import {spotReducers} from "../../spots/Spot.constants";
import {homeReducers} from "../../views/home/Home.constants";
import {notebookReducers} from "../notebook-panel/Notebook.constants";
import {settingPanelReducers} from "../../components/settings-panel/settingsPanel.constants";
// import imageStyles from "../images/images.styles";
// import {Button, ListItem} from "react-native-elements";
// import {isEmpty} from '../../shared/Helpers';
// import spotListStyles from "../../spots/SpotListStyles";
// import {SettingsMenuItems} from "./SettingsMenu.constants";
// import {settingsPanelReducer} from "./settingsPanel.reducer";

const sortButtons = (props) => {
  // const [refresh, setRefresh] = useState(false);
  // const [sortedList, setSortedList] = useState(props.spots);
  const {selectedSpot} = props;
  const {spots} = props;

  useEffect(() => {
    updateIndex(props.selectedButtonIndex);
    console.log('render is Sorting.js!')
  }, []);

  useEffect(() => {
    // props.setSortedList(spots);
    // setRefresh(!refresh);
    console.log('render Recent Views!')
  }, [selectedSpot, spots]);

  const updateIndex = (selectedButtonIndex) => {
    props.setSelectedButtonIndex(selectedButtonIndex);
    switch (selectedButtonIndex) {
      case 0:
        console.log('Chronological Selected');
        props.setSortedListView(SortedViews.CHRONOLOGICAL);
        props.setSortedList(props.spots.sort(((a, b) => {
          return new Date(a.properties.date) - new Date(b.properties.date)
        })));
        break;
      case 1:
        console.log('Map Extent Selected');
        props.setSortedListView(SortedViews.MAP_EXTENT);
        break;
      case 2:
        console.log('Recent Selected');
        props.setSortedListView(SortedViews.RECENT_VIEWS);
        break;
    }
  };
  return (
    <React.Fragment>
      <SharedUI.ButtonGroup
        selectedIndex={props.selectedButtonIndex}
        buttons={['Chronological', 'Map Extent', 'Recent \n Views']}
        containerStyle={{height: 50}}
        buttonStyle={{padding: 5}}
        textStyle={{fontSize: 12}}
        onPress={(selected) => updateIndex(selected)}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    imagePaths: state.images.imagePaths,
    spots: state.spot.features,
    recentViews: state.spot.recentViews,
    sortedView: state.images.sortedView,
    selectedButtonIndex: state.settingsPanel.selectedButtonIndex,
    settingsPageVisible: state.settingsPanel.settingsPageVisible,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
    sortedList: state.settingsPanel.sortedList
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image}),
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
  setSortedList: (type) => ({type: settingPanelReducers.SET_SORTED_LIST, sortedList: type})
};

export default connect(mapStateToProps, mapDispatchToProps)(sortButtons);
