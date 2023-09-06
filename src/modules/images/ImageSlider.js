import * as React from 'react';
import {useState} from 'react';
import {Dimensions, Image, Platform, View} from 'react-native';

import Carousel from 'react-native-reanimated-carousel';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import styles from './images.styles';
import imageSliderStyles from './imageSlider.styles';

const ImageIndex = ({openNotebookPanel, toggle, route, navigation}) => {
  console.log('ROUTE', route);
  // const selectedImage = route.params.selectedImage;
  const platform = Platform.OS === 'ios' ? 'screen' : 'window';
  const width = Dimensions.get(platform).width * .60;

  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);

  const [imageProperties, setImageProperties] = useState(false);

  const [useSpots] = useSpotsHook();

  const getSpotFromId = (spotId) => {
    toggle();
    const spot = spots[spotId];
    navigation.navigate('HomeScreen', {pageKey: PAGE_KEYS.OVERVIEW});
    dispatch(setSelectedSpot(spot));
  };

  const renderImage = (image, index) => {
    setImageProperties(image);
    return (
      <View style={imageSliderStyles.imageContainer}>
        <Image
          source={{uri: image.uri}}
          style={imageSliderStyles.image}
        />
      </View>
    );
  };

  return (
    <View style={imageSliderStyles.sliderContainer}>
      <View style={imageSliderStyles.buttonContainer}>
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/NotebookNavButton.png')}
          onPress={() => {
            getSpotFromId(useSpots.getSpotByImageId(imageProperties.image.id).properties.id);
          }}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/Close.png')}
          onPress={() => navigation.goBack()}
        />
      </View>
      <Carousel
        loop
        width={width}
        // height={500}
        // autoPlay={true}
        data={images}
        scrollAnimationDuration={500}
        onSnapToItem={index => console.log('current index:', index)}
        renderItem={({item, index}) => renderImage(item, index)}
      />

    </View>
  );
};

export default ImageIndex;
