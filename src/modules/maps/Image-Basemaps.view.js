
import React, {useState, useRef ,useEffect} from 'react';
import {ActivityIndicator, Alert, FlatList, ScrollView, Text, View} from 'react-native';
//import {setForm} from '../form/form.container';
import {connect} from 'react-redux';
import * as SharedUI from '../../shared/ui/index';
import {homeReducers} from '../home/home.constants';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers, SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
// Constants
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {spotReducers} from '../spots/spot.constants';

// Hooks
import useImagesHook from '../images/useImages';
import useSpotsHook from '../spots/useSpots';

// Styles
import attributesStyles from '../main-menu-panel/attributes.styles';
import imageStyles from '../images/images.styles';
import { withNavigation } from 'react-navigation';

const ImageBaseMaps = (props) => {
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj(); 
  const [imageBaseMapSet,setImageBaseMapsSet] = useState(useSpots.getAllImageBaseMaps());
  const [useImages] = useImagesHook();
  const [refresh, setRefresh] = useState(false);
  let savedArray = [];

  useEffect(() => {
    return function cleanUp() {
      props.setSortedListView(SortedViews.CHRONOLOGICAL);
      props.setSelectedButtonIndex(0);
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
   // setSortedList(Object.values(activeSpotsObj));
    setImageBaseMapsSet(useSpots.getAllImageBaseMaps());
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
      return imageSave();
    }
  };

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {item.title}
          </Text>
        </View>
        <FlatList
          
          data={imageBaseMapList.filter(obj => { return obj.id == item.id})}
          numColumns={3}
          renderItem={({item}) => renderImageBaseMap(item)}
        />
      </View>
    );
  };

  const renderImageBaseMap = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.thumbnail}
          onPress={() => openImageBaseMap(image)}
        />
        
      </View>   
    );
  };

  const openImageBaseMap = (image) => {
    props.setSelectedAttributes([image]);
   // setForm('images');
    props.navigation.navigate('ImageBasemapInfo', {imageId: image.id});
  };

  let sortedView = null;
  const imageBaseMapList = Array.from(imageBaseMapSet);
  if (!isEmpty(imageBaseMapList)) {
      sortedView = <FlatList
        keyExtractor={(item) => item.id.toString()}
       extraData={refresh}
       data={imageBaseMapList}
       renderItem={({item}) => renderName(item)}
    />;
    return (
      <React.Fragment>
        <View style={imageStyles.galleryImageContainer}>
          {sortedView}
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
  if(!isEmpty(state.spot.spots))
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ImageBaseMaps));