import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, FlatList, ScrollView, Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import {connect} from 'react-redux';

import * as SharedUI from '../../shared/ui/index';
import {homeReducers} from '../../views/home/Home.constants';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers, SortedViews} from '../settings-panel/settingsPanel.constants';
import SortingButtons from '../settings-panel/SortingButtons';

// Constants
import {notebookReducers} from '../notebook-panel/Notebook.constants';
import {spotReducers} from '../../spots/Spot.constants';

// Hooks
import useImagesHook from './useImages';
import useSpotsHook from '../../spots/useSpots';

// Styles
import attributesStyles from '../../components/settings-panel/settingsPanelSectionStyles/Attributes.styles';
import imageStyles from './images.styles';

const imageGallery = (props) => {
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj();
  const [useImages] = useImagesHook();
  const [refresh, setRefresh] = useState(false);
  const [sortedList, setSortedList] = useState(Object.values(activeSpotsObj));
  let savedArray = [];

  useEffect(() => {
    console.log('ImageView render!');
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    setSortedList(Object.values(activeSpotsObj));
    // setRefresh(!refresh);
    console.log('render Recent Views in ImageGallery.js!');
  }, [props.selectedSpot, props.spots, props.sortedListView]);

  const imageSave = async () => {
    const savedPhoto = await useImages.pictureSelectDialog();
    console.log('imageObj', savedPhoto);

    if (savedPhoto === 'cancelled') {
      console.log('User cancelled image picker', savedArray);
      if (savedArray.length > 0) {
        console.log('ALL PHOTOS SAVED', savedArray);
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...');
      }
    }
    else if (savedPhoto.error) {
      console.log('ImagePicker Error: ', savedPhoto.error);
    }
    else {
      savedArray.push(savedPhoto);
      console.log('AllPhotosSaved', savedArray);
      imageSave();
    }
  };

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {item.properties.name}
          </Text>
          <Button
            titleStyle={{fontSize: 16}}
            title={'View In Spot'}
            type={'clear'}
            onPress={() => props.getSpotData(item.properties.id)}
          />
        </View>
        <FlatList
          keyExtractor={(image) => image.id}
          data={item.properties.images}
          numColumns={3}
          renderItem={({item}) => renderImage(item)}
        />
      </View>
    );
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.thumbnail}
          PlaceholderContent={<ActivityIndicator/>}
          onPress={() => renderImageModal(image)}
        />
      </View>
    );
  };

  const renderRecentView = (spotID) => {
    const spot = props.spots[spotID];
    if (spot.properties.images && !isEmpty(spot.properties.images)) {
      return (
        <View style={attributesStyles.listContainer}>
          <View style={attributesStyles.listHeading}>
            <Text style={attributesStyles.headingText}>
              {spot.properties.name}
            </Text>
            <Button
              titleStyle={{fontSize: 16}}
              title={'View In Spot'}
              type={'clear'}
              onPress={() => props.getSpotData(spot.properties.id)}
            />
          </View>
          <FlatList
            data={spot.properties.images === undefined ? null : spot.properties.images}
            keyExtractor={(image) => image.id}
            numColumns={3}
            renderItem={({item}) => renderImage(item)}
          />
        </View>

      );
    }
  };

  const renderImageModal = (image) => {
    console.log(image.id, '\n was pressed!');
    props.setSelectedAttributes([image]);
    props.setIsImageModalVisible(true);
  };

  let sortedView = null;
  const filteredList = sortedList.filter(spot => {
    return !isEmpty(spot.properties.images);
  });
  if (!isEmpty(filteredList)) {
    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      sortedView = <FlatList
        keyExtractor={(item) => item.toString()}
        extraData={refresh}
        data={props.recentViews}
        renderItem={({item}) => renderRecentView(item)}/>;
    }
    else {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={Object.values(activeSpotsObj)}
        renderItem={({item}) => renderName(item)}/>;
    }
    return (
      <React.Fragment>
        <SortingButtons/>
        <View style={imageStyles.galleryImageContainer}>
          {sortedView}
        </View>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Images in Active Datasets</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    recentViews: state.spot.recentViews,
    selectedImage: state.spot.selectedAttributes[0],
    selectedSpot: state.spot.selectedSpot,
    sortedListView: state.settingsPanel.sortedView,
    spots: state.spot.spots,
  };
};

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: settingPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: settingPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
