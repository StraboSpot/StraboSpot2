import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, Platform, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';
import Carousel from 'react-native-reanimated-carousel';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import styles from './images.styles';
import imageSliderStyles from './imageSlider.styles';
import useImagesHook from './useImages';

const ImageIndex = ({route, navigation}) => {
  const platform = Platform.OS === 'ios' ? 'screen' : 'window';
  const width = Dimensions.get(platform).width;
  const height = Dimensions.get(platform).height;

  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const [startingImageIndex, setStartingImageIndex] = useState(0);

  const ref = useRef();
  const imageRef = useRef(route.params.selectedImage);
  const imagesDataRef = useRef();

  useEffect(() => {
    console.log('IMAGE SLIDER UE', imagesDataRef);
    populateImageSlideshowData();
  }, []);

  const getImageUrlFromServer = (imageId) => {
    return useImages.getImageScreenSizedURI(imageId);
    // return imageUrl + imageId;
  };

  const getSpotFromId = (imageId) => {
    const spotId = useSpots.getSpotByImageId(imageId).properties.id;
    const spot = spots[spotId];
    navigation.navigate('HomeScreen', {pageKey: PAGE_KEYS.OVERVIEW});
    dispatch(setSelectedSpot(spot));
  };

  const populateImageSlideshowData = async () => {
    // toggleHomeDrawerButton();
    let firstImageID = imageRef.current.id;
    let uri = useImages.getLocalImageURI(firstImageID);
    const imagesForSlideshow = Object.values(useSpots.getActiveSpotsObj()).reduce((acc, spot) => {
      const imagesForSlideshow1 = spot.properties.images
        && spot.properties.images.reduce((acc1, image) => {
          // const imageFromServer = getImageUrlFromServer(image.id);
          uri = Platform.OS !== 'web' ? useImages.getLocalImageURI(image.id) : getImageUrlFromServer(image.id);
          // return (image.id !== firstImageID) ? [...acc1, {image, uri, currentIndex}] : acc1;
          return [...acc1, {image, uri}];
        }, []) || [];
      return [...acc, ...imagesForSlideshow1];
    }, []);
    imagesDataRef.current = imagesForSlideshow;
    setStartingImageIndex(imagesForSlideshow.findIndex(image => image.image.id === firstImageID));
  };

  const renderImage = (image) => {
    return (
      <View style={imageSliderStyles.imageContainer}>
        <Image
          source={{uri: image.uri}}
          style={Platform.OS === 'web' ? {
              width: '90%',
              height: '90%',
              resizeMode: 'contain',
            }
            : imageSliderStyles.image}
        />
      </View>
    );
  };

  return (
    <View style={imageSliderStyles.sliderContainer}>
      <View style={imageSliderStyles.buttonsContainer}>
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/NotebookNavButton.png')}
          onPress={() => {
            getSpotFromId(imageRef.current.id);
          }}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/Close.png')}
          onPress={() => navigation.goBack()}
        />
      </View>
      <Carousel
        scrollEnabled={false}
        ref={ref}
        width={width}
        height={height}
        defaultIndex={startingImageIndex}
        data={imagesDataRef.current}
        scrollAnimationDuration={500}
        onSnapToItem={index => console.log('current index:', index)}
        renderItem={({item, index}) => renderImage(item, index)}
        // panGestureHandlerProps={{maxPointers: 0}}
      />
      {Platform.OS === 'web' && <View style={imageSliderStyles.navButtonsContainer}>
        <Button
          icon={
            <Icon
              name={'chevron-back'}
              type={'ionicon'}
              size={36}
            />
          }
          type={'clear'}
          containerStyle={{
            borderRadius: 50,
            borderWidth: 1,
            backgroundColor: '#cccaca',
          }}
          onPress={() => ref.current.prev(0)}
        />
        <Button
          icon={
            <Icon
              name={'chevron-forward'}
              type={'ionicon'}
              size={36}
            />
          }
          type={'clear'}
          containerStyle={{
            borderRadius: 50,
            borderWidth: 1,
            backgroundColor: '#cccaca',
          }}
          onPress={() => ref.current.next(0)}
        />
      </View>}
    </View>
  );
};

export default ImageIndex;
