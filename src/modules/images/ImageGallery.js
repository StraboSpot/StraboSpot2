import React, {useState, useEffect} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {connect} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import {homeReducers} from '../home/home.constants';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {mainMenuPanelReducers, SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const ImageGallery = (props) => {
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const activeSpotsObj = useSpots.getActiveSpotsObj();

  const [sortedList, setSortedList] = useState(Object.values(activeSpotsObj));
  const [filteredList] = useState(sortedList.filter(spot => !isEmpty(spot.properties.images)));
  //const spots = useSpots.getSpotsWithImages()
  const [refresh] = useState(false);

  useEffect(() => {
    console.log('UE ImageGallery []');
    return function reset() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('Reset Image Gallery');
    };
  }, []);

  useEffect(() => {
    setSortedList(Object.values(activeSpotsObj));
    console.log('render Recent Views in ImageGallery.js!');
  }, [props.selectedSpot, props.spots, props.sortedListView]);

  const renderImagesInSpot = (spot) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
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
          keyExtractor={(image) => image.id}
          data={spot.properties.images}
          numColumns={3}
          renderItem={({item}) => renderImage(item)}
        />
      </View>
    );
  };

  const renderImage = (image) => {
    const imgPath = useImages.getLocalImageURI(image.id);
    console.log('imgPath', imgPath);
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          // source={{uri: useImages.getLocalImageURI(image.id)}}
          source={{uri: imgPath}}
          style={imageStyles.thumbnail}
          //PlaceholderContent={<ActivityIndicator/>}
          onPress={() => handleImagePressed(image)}
        />
      </View>
    );
  };

  const handleImagePressed = (image) => {
    useImages.doesImageExist(image.id)
      .then((doesExist) => {
        if (doesExist) {
          console.log('Opening image', image.id, '...');
          props.setSelectedAttributes([image]);
          props.setIsImageModalVisible(true);
        }
        else Alert.alert('Missing Image!', 'Unable to find image file on this device.');
      })
      .catch((e) => console.error('Image not found', e));
  };

  let sortedView = null;
  if (!isEmpty(filteredList)) {
    if (props.sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = (
        <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderImagesInSpot(item)}/>
      );
    }
    else if (props.sortedListView === SortedViews.MAP_EXTENT) {
      const spotsInMapExtentWithImages = props.spotsInMapExtent.filter(spot => spot.properties.images);
      if (!isEmpty(spotsInMapExtentWithImages)) {
        sortedView = (
          <FlatList
            keyExtractor={(item) => item.properties.id.toString()}
            extraData={refresh}
            data={spotsInMapExtentWithImages}
            renderItem={({item}) => renderImagesInSpot(item)}/>
        );
      }
      else sortedView = <Text style={{padding: 10}}>No Spots in current map extent with images</Text>;
    }
    else if (props.sortedListView === SortedViews.RECENT_VIEWS) {
      const recentlyViewedSpotIds = props.recentViews;
      const recentlyViewedSpots = recentlyViewedSpotIds.map(spotId => props.spots[spotId]);
      const recentlyViewedSpotsWithImages = recentlyViewedSpots.filter(spot => spot.properties.images);
      if (!isEmpty(recentlyViewedSpotsWithImages)) {
        sortedView = (
          <FlatList
            keyExtractor={(item) => item.properties.id.toString()}
            extraData={refresh}
            data={recentlyViewedSpotsWithImages}
            renderItem={({item}) => renderImagesInSpot(item)}/>
        );
      }
      else sortedView = <Text style={{padding: 10}}>No recently viewed Spots with images</Text>;
    }
    else {
      sortedView = (
        <FlatList
          keyExtractor={(item) => item.properties.id.toString()}
          extraData={refresh}
          data={Object.values(activeSpotsObj)}
          renderItem={({item}) => renderImagesInSpot(item)}/>
      );
    }

    return (
      <React.Fragment>
        {isEmpty(useSpots.getSpotsWithImages()) ?
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
    sortedListView: state.mainMenu.sortedView,
    spots: state.spot.spots,
  };
};

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setSortedListView: (view) => ({type: mainMenuPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: mainMenuPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery);
