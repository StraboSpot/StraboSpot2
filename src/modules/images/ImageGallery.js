import React from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import {setImageModalVisible} from '../home/home.slice';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const ImageGallery = (props) => {
  const dispatch = useDispatch();

  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);

  const handleImagePressed = (image) => {
    console.log('Pressed image:', image);
    useImages.doesImageExist(image.id)
      .then((doesExist) => {
        if (doesExist) {
          console.log('Opening image', image.id, '...');
          dispatch(setSelectedAttributes([image]));
          dispatch(setImageModalVisible(true));
        }
        else Alert.alert('Missing Image!', 'Unable to find image file on this device.');
      })
      .catch((e) => console.error('Image not found', e));
  };

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
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageURI(image.id)}}
          style={imageStyles.thumbnail}
          //PlaceholderContent={<ActivityIndicator/>}
          onPress={() => handleImagePressed(image)}
        />
      </View>
    );
  };

  const renderNoImages = () => {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Images in Active Datasets</Text>
      </View>
    );
  };

  const renderSpotsWithImages = () => {
    let sortedSpotsWithImages = useSpots.getSpotsWithImagesSortedReverseChronologically();
    let noImagesText = 'No Spots with images';
    if (sortedView === SortedViews.MAP_EXTENT) {
      sortedSpotsWithImages = props.spotsInMapExtent.filter(spot => spot.properties.images);
      if (isEmpty(sortedSpotsWithImages)) noImagesText = 'No Spots with images in current map extent';
    }
    else if (sortedView === SortedViews.RECENT_VIEWS) {
      const recentlyViewedSpots = recentViews.map(spotId => spots[spotId]);
      sortedSpotsWithImages = recentlyViewedSpots.filter(spot => spot.properties.images);
      if (!isEmpty(sortedSpotsWithImages)) noImagesText = 'No recently viewed Spots with images';
    }
    return (
      <React.Fragment>
        <SortingButtons/>
        <View style={imageStyles.galleryImageContainer}>
          {isEmpty(sortedSpotsWithImages)
            ? <Text style={{padding: 10}}>{noImagesText}</Text>
            : (
              <FlatList
                keyExtractor={(item) => item.properties.id.toString()}
                data={sortedSpotsWithImages}
                renderItem={({item}) => renderImagesInSpot(item)}
              />
            )
          }
        </View>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getSpotsWithImages()) ? renderNoImages() : renderSpotsWithImages()}
    </React.Fragment>
  );
};

export default ImageGallery;
