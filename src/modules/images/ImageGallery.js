import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, SectionList, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Icon, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import imageStyles from './images.styles';
import useImagesHook from './useImages';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setLoadingStatus} from '../home/home.slice';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {PAGE_KEYS} from '../page/page.constants';
import useSpotsHook from '../spots/useSpots';
import FastImage from 'react-native-fast-image';
import Loading from '../../shared/ui/Loading';

const ImageGallery = ({openSpotInNotebook}) => {
  console.log('Rendering ImageGallery...');

  const dispatch = useDispatch();

  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();
  const navigate = useNavigation();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spots = useSelector(state => state.spot.spots);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});
  const [numberOfImages, setNumberOfImages] = useState(0);

  let sortedSpotsWithImages = [];

  useEffect(() => {
    console.log('UE ImageGallery []');
    getImageThumbnailURIs().catch(err => console.error(err));
    return () => {
      FastImage.clearDiskCache().then(() => console.log('Disk Cache Cleared'))
      FastImage.clearMemoryCache().then(() => console.log('Memory Cleared'))
    }
  }, []);

  const getImageThumbnailURIs = async () => {
    try {
      const spotsWithImages = useSpots.getSpotsWithImages();
      const totalNumberOfImages = useImages.getProjectImages(spotsWithImages);
      setNumberOfImages(totalNumberOfImages);
      console.log('Getting Image URI Thumbnails!');
      setIsLoading(true)
      const imageThumbnailURIsTemp = await useImages.getImageThumbnailURIs(spotsWithImages);
      setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
      console.log('Image URI Thumbnails are done!');
      setIsLoading(false)
      setImageThumbnails(imageThumbnailURIsTemp);
      setIsError(false);
    }
    catch (err) {
      console.error('Error in getImageThumbnailURIs', err);
      setIsError(true);
    }
  };

  const handleImagePressed = async (image) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    console.log('Opening image', image.id, '...');
    navigate.navigate('ImageSlider', {selectedImage: image, sortedSpotsWithImages: sortedSpotsWithImages});
    dispatch(setLoadingStatus({view: 'home', bool: false}));
  };

  const renderImagesInSpot = (images) => {
    return (
      <FlatList
        keyExtractor={image => image.id}
        data={images}
        numColumns={3}
        renderItem={({item, index}) => renderImage(item, index)}
      />
    );
  };

  const renderImage = (image, i) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Pressable onPress={() => handleImagePressed(image, i)}>
          <FastImage
            fallback
            style={imageStyles.thumbnail}
            source={{
              uri: imageThumbnails[image.id],
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.contain}
            // onLoadStart={() => setIsLoading(true)}
            // onLoadStart={() => dispatch(setLoadingStatus({view: 'home', bool: true}))}
            onLoadEnd={() => {
              // dispatch(setLoadingStatus({view: 'home', bool: false}));
              // setIsLoading(false)
              if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));
            }}
            onError={() => {
              if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));
            }}
          />
        </Pressable>
        {/*<Image*/}
        {/*  style={imageStyles.thumbnail}*/}
        {/*  onPress={() => handleImagePressed(image, i)}*/}
        {/*  source={imageThumbnails[image.id] ? {uri: imageThumbnails[image.id]} : placeholderImage}*/}
        {/*  PlaceholderContent={isEmpty(isImageLoadedObj) || !isImageLoadedObj[image.id] ? <ActivityIndicator/>*/}
        {/*    : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}*/}
        {/*  placeholderStyle={commonStyles.imagePlaceholder}*/}
        {/*  onError={() => {*/}
        {/*    if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));*/}
        {/*  }}*/}
        {/*  onLoadEnd={() => {*/}
        {/*    if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));*/}
        {/*  }}*/}
        {/*/>*/}
      </View>
    );
  };

  const renderNoImagesText = () => {
    return <ListEmptyText text={'No Images in Active Datasets'}/>;
  };

  const renderError = () => (
    <View style={{paddingTop: 75}}>
      <Icon name={'alert-circle-outline'} type={'ionicon'} size={100}/>
      <Text style={[commonStyles.noValueText, {paddingTop: 50}]}>Problem getting thumbnail images...</Text>
    </View>
  );

  const renderSectionHeader = ({spot}) => {
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={spot.properties.name}
          buttonTitle={'View In Spot'}
          onPress={() => openSpotInNotebook(spot, PAGE_KEYS.IMAGES)}
        />
      </View>
    );
  };

  const renderSpotsWithImages = () => {
    sortedSpotsWithImages = useSpots.getSpotsWithImagesSortedReverseChronologically();
    let noImagesText = 'No Spots with images';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpotsWithImages = spotsInMapExtent.filter(spot => spot.properties.images);
      if (isEmpty(sortedSpotsWithImages)) noImagesText = 'No Spots with images in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      const recentlyViewedSpots = recentViews.map(spotId => spots[spotId]);
      sortedSpotsWithImages = recentlyViewedSpots.filter(spot => spot.properties.images);
      if (!isEmpty(sortedSpotsWithImages)) noImagesText = 'No recently viewed Spots with images';
    }
    const spotsAsSections = sortedSpotsWithImages.reduce(
      (acc, spot) => [...acc, {spot: spot, data: [spot.properties.images]}], []);
    return (
      <React.Fragment>
        <SortingButtons/>
        <View style={imageStyles.galleryImageContainer}>
          <SectionList
            keyExtractor={(item, index) => item + index}
            sections={spotsAsSections}
            renderSectionHeader={({section}) => renderSectionHeader(section)}
            renderItem={({item}) => renderImagesInSpot(item)}
            ListEmptyComponent={<ListEmptyText text={noImagesText}/>}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getSpotsWithImages()) ? renderNoImagesText()
        : !isError ? renderSpotsWithImages()
          : renderError()}
      <View style={imageStyles.imagesCountContainer}>
        <Text style={imageStyles.imagesCountText}>Total Number of Images: {numberOfImages}</Text>
      </View>
      {isLoading && (
        <Loading isLoading={isLoading}/>
      )}
    </React.Fragment>
  );
};

export default ImageGallery;
