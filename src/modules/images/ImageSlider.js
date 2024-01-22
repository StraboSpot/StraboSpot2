import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Platform, useWindowDimensions, View} from 'react-native';

import {Button, Icon, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {imageStyles, imageSliderStyles, useImagesHook} from '.';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedSpot} from '../spots/spots.slice';

const ImageSlider = ({route, navigation}) => {
  console.log('Rendering ImageSlider...');
  const {width, height} = useWindowDimensions();
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);

  const useImages = useImagesHook();

  const [imageIndex, setImageIndex] = useState(undefined);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imagesObj = useMemo(() => {
    const sortedSpotsWithImages = route.params.sortedSpotsWithImages;
    return sortedSpotsWithImages.reduce((acc, spot) => {
      const imagesInSpot = spot.properties.images?.reduce((acc1, image) => {
        return [...acc1, {imageId: image.id, spotId: spot.properties.id}];
      }, []);
      return [...acc, ...imagesInSpot];
    }, []);
  }, [route.params.sortedSpotsWithImages]);

  if (isEmpty(imageIndex)) {
    const startImageId = route.params.selectedImage.id;
    const startIndex = imagesObj.map(i => i.imageId).indexOf(startImageId);
    setImageIndex(startIndex);
  }

  const getSpotFromId = () => {
    console.log('getSpotFromId getCurrentIndex', imageIndex);
    const spot = spots[imagesObj[imageIndex].spotId];
    navigation.navigate('HomeScreen', {pageKey: PAGE_KEYS.OVERVIEW});
    dispatch(setSelectedSpot(spot));
  };

  const onPressNext = () => {
    setIsImageLoaded(false);
    setImageIndex(i => i === imagesObj.length - 1 ? 0 : i + 1);
  };

  const onPressPrevious = () => {
    setIsImageLoaded(false);
    setImageIndex(i => i === 0 ? imagesObj.length - 1 : i - 1);
  };

  if (!isEmpty(imageIndex)) {
    const imageId = imagesObj[imageIndex].imageId;
    return (
      <View style={{backgroundColor: 'black'}}>
        <View style={imageSliderStyles.buttonsContainer}>
          <IconButton
            style={imageStyles.imageInfoButtons}
            source={require('../../assets/icons/NotebookNavButton.png')}
            onPress={getSpotFromId}
          />
          <IconButton
            style={imageStyles.imageInfoButtons}
            source={require('../../assets/icons/Close.png')}
            onPress={() => navigation.goBack()}
          />
        </View>
        <Image
          source={Platform.OS === 'web' ? {uri: useImages.getImageScreenSizedURI(imageId)}
            : {uri: useImages.getLocalImageURI(imageId)}}
          style={Platform.OS === 'web' ? {
              width: width,
              height: height,
            }
            : {width: '100%', height: '100%'}}
          resizeMode={'contain'}
          PlaceholderContent={!isImageLoaded ? <ActivityIndicator/>
            : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
          placeholderStyle={commonStyles.imagePlaceholder}
          onError={() => setIsImageLoaded(true)}
          onLoadEnd={() => setIsImageLoaded(true)}
        />
        <View style={imageSliderStyles.navButtonsContainer}>
          <Button
            icon={
              <Icon
                name={'chevron-back'}
                type={'ionicon'}
                size={36}
              />
            }
            type={'clear'}
            containerStyle={{borderRadius: 50, borderWidth: 1, backgroundColor: '#cccaca'}}
            onPress={onPressPrevious}
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
            containerStyle={{borderRadius: 50, borderWidth: 1, backgroundColor: '#cccaca'}}
            onPress={onPressNext}
          />
        </View>
      </View>
    );
  }
};

export default ImageSlider;
