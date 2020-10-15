import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';

import {connect} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {mainMenuPanelReducers, SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import useSpotsHook from '../spots/useSpots';
import {mapReducers} from './maps.constants';

const ImageBaseMaps = (props) => {
  const [useSpots] = useSpotsHook();
  const [imageBasemaps, setImageBasemaps] = useState();
  const [useImages] = useImagesHook();
  const missingImage = require('../../assets/images/noimage.jpg');

  useEffect(() => {
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    //setImageBasemaps(useSpots.getAllImageBaseMaps());
    setImageBasemaps(useSpots.getImageBasemaps());
  }, [props.selectedSpot, props.spots, props.sortedListView]);

  const renderImageBasemapThumbnail = async (imageData) => {
    console.log('image basemap item', imageData);
    let imageURI;
    let isExist = true;
    //isExist = await useImages.doesImageExist(imageData.id);
    if (isExist) imageURI = useImages.getLocalImageSrc(imageData.id);
    console.log('imageData imageURI', imageURI);
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {imageData.title}
          </Text>
        </View>
        <View style={imageStyles.thumbnailContainer}>
          <SharedUI.ImageButton
            source={imageURI ? {uri: imageURI} : require('../../assets/images/noimage.jpg')}
            style={imageStyles.thumbnail}
            onPress={() => openImageBaseMap(imageData)}
          />
        </View>
      </View>
    );
  };

  const openImageBaseMap = (imageBasemap) => {
    // Calling map reducer to update the state
    console.log('trying to update imagebasemap', imageBasemap);
    props.updateImageBasemap(imageBasemap);
  };

  //const imageBasemapList = Array.from(imageBasemaps);
  const imageBasemapList = imageBasemaps;
  console.log('imageBasemapList', imageBasemapList);
  if (!isEmpty(imageBasemapList)) {
    return (
      <React.Fragment>
        <View style={imageStyles.galleryImageContainer}>
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={imageBasemapList}
            numColumns={3}
            renderItem={({item}) => renderImageBasemapThumbnail(item)}
          />
        </View>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Image-Basemaps found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  if (!isEmpty(state.spot.spots)) {
    return {
      selectedSpot: state.spot.selectedSpot,
      sortedListView: state.mainMenu.sortedView,
      spots: state.spot.spots,
    };
  }
};

const mapDispatchToProps = {
  setSortedListView: (view) => ({type: mainMenuPanelReducers.SET_SORTED_VIEW, view: view}),
  setSelectedButtonIndex: (index) => ({type: mainMenuPanelReducers.SET_SELECTED_BUTTON_INDEX, index: index}),
  updateImageBasemap: (currentImageBasemap) => ({
    type: mapReducers.CURRENT_IMAGE_BASEMAP,
    currentImageBasemap: currentImageBasemap,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageBaseMaps);
