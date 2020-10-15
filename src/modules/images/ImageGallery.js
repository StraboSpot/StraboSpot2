import React, {useState, useEffect} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import {setImageModalVisible} from '../home/home.slice';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import {setSelectedButtonIndex, setSortedView} from '../main-menu-panel/mainMenuPanel.slice';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

let imageCount = 0;
// let dirs = RNFetchBlob.fs.dirs;
// const url = 'https://strabospot.org/testimages/images.json';
// const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
// const appDirectory = '/StraboSpot';
// const imagesResizeTemp = '/TempImages';
// const imagesDirectory = devicePath + appDirectory + '/Images';

const ImageGallery = (props) => {
  const dispatch = useDispatch();
  const sortedListView = useSelector(state => state.mainMenu.sortedView);
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj();
  const [useImages] = useImagesHook();
  const [refresh] = useState(false);
  const [sortedList, setSortedList] = useState(Object.values(activeSpotsObj));
  const [filteredList] = useState(sortedList.filter(spot => {
    return !isEmpty(spot.properties.images);
  }));
  let savedArray = [];

  useEffect(() => {
    console.log('ImageView render!');
    return function cleanUp() {
      dispatch(setSortedView({view: SortedViews.CHRONOLOGICAL}));
      dispatch(setSelectedButtonIndex({index: 0}));
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    setSortedList(Object.values(activeSpotsObj));
    // setRefresh(!refresh);
    console.log('render Recent Views in ImageGallery.js!');
  }, [props.selectedSpot, props.spots, sortedListView]);

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

    // const resizeImage = useImages.resizeImageToThumbnail(image);
    // console.log('Resized', resizeImage)
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.thumbnail}
          // PlaceholderContent={<ActivityIndicator/>}
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
    dispatch(setImageModalVisible({bool: true}));
  };

  let sortedView = null;
  // const filteredList = sortedList.filter(spot => {
  //   return !isEmpty(spot.properties.images);
  // });
  if (!isEmpty(filteredList)) {
    if (sortedListView === SortedViews.CHRONOLOGICAL) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (sortedListView === SortedViews.MAP_EXTENT) {
      sortedView = <FlatList
        keyExtractor={(item) => item.properties.id.toString()}
        extraData={refresh}
        data={filteredList}
        renderItem={({item}) => renderName(item)}/>;
    }
    else if (sortedListView === SortedViews.RECENT_VIEWS) {
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
    spots: state.spot.spots,
  };
};

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery);
