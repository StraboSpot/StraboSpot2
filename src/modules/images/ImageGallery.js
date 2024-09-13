import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, SectionList, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Icon, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {imageStyles, useImagesHook} from '.';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import UpdateSpotsInMapExtentButton from '../../shared/ui/UpdateSpotsInMapExtentButton';
import {setLoadingStatus} from '../home/home.slice';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {PAGE_KEYS} from '../page/page.constants';
import useSpotsHook from '../spots/useSpots';

const ImageGallery = ({openSpotInNotebook, updateSpotsInMapExtent}) => {
  // console.log('Rendering ImageGallery...');

  const navigate = useNavigation();
  const useImages = useImagesHook();
  const useSpots = useSpotsHook();

  const dispatch = useDispatch();
  const sortedView = useSelector(state => state.mainMenu.sortedView);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  let sortedSpotsWithImages = [];

  useEffect(() => {
    // console.log('UE ImageGallery []');
    getImageThumbnailURIs().catch(err => console.error(err));
  }, []);

  const getImageThumbnailURIs = async () => {
    try {
      const spotsWithImages = useSpots.getSpotsWithImages();
      // console.log('Getting Image URI Thumbnails!');
      const imageThumbnailURIsTemp = await useImages.getImageThumbnailURIs(spotsWithImages);
      setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
      // console.log('Image URI Thumbnails are done!');
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
        <Image
          style={imageStyles.thumbnail}
          onPress={() => handleImagePressed(image, i)}
          source={imageThumbnails[image.id] ? {uri: imageThumbnails[image.id]} : placeholderImage}
          PlaceholderContent={isEmpty(isImageLoadedObj) || !isImageLoadedObj[image.id] ? <ActivityIndicator/>
            : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
          placeholderStyle={commonStyles.imagePlaceholder}
          onError={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));
          }}
          onLoadEnd={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(j => ({...j, [image.id]: true}));
          }}
        />
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
    let noImagesText = 'No active Spots with images';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      const spotsInMapExtent = useSpots.getSpotsInMapExtent();
      sortedSpotsWithImages = spotsInMapExtent.filter(spot => !isEmpty(spot.properties.images));
      if (isEmpty(sortedSpotsWithImages)) noImagesText = 'No active Spots with images in current map extent';
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      const recentlyViewedSpots = useSpots.getRecentSpots();
      sortedSpotsWithImages = recentlyViewedSpots.filter(spot => !isEmpty(spot.properties.images));
      if (!isEmpty(sortedSpotsWithImages)) noImagesText = 'No recently viewed active Spots with images';
    }
    let count = 0;
    const spotsAsSections = sortedSpotsWithImages.reduce((acc, spot) => {
      count += spot.properties.images.length;
      return [...acc, {spot: spot, data: [spot.properties.images]}];
    }, []);

    return (
      <>
        <SortingButtons/>
        {sortedView === SORTED_VIEWS.MAP_EXTENT && (
          <UpdateSpotsInMapExtentButton
            title={'Update Images in Map Extent'}
            updateSpotsInMapExtent={updateSpotsInMapExtent}
          />
        )}
        <View style={imageStyles.galleryImageContainer}>
          <SectionDivider dividerText={count + (count === 1 ? ' Image' : ' Images') + ' in active Spots'}/>
          <SectionList
            keyExtractor={(item, index) => item + index}
            sections={spotsAsSections}
            renderSectionHeader={({section}) => renderSectionHeader(section)}
            renderItem={({item}) => renderImagesInSpot(item)}
            ListEmptyComponent={<ListEmptyText text={noImagesText}/>}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </>
    );
  };

  return (
    <>
      {isEmpty(useSpots.getSpotsWithImages()) ? renderNoImagesText()
        : !isError ? renderSpotsWithImages()
          : renderError()}
    </>
  );
};

export default ImageGallery;
