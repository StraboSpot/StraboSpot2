import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, SectionList, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Icon, Image} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {imageStyles, useImagesHook} from '.';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setLoadingStatus} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {useSpots} from '../spots';
import SpotFilters from '../spots/SpotFilters';

const ImageGallery = ({openSpotInNotebook, updateSpotsInMapExtent}) => {
  // console.log('Rendering ImageGallery...');

  const navigate = useNavigation();
  const useImages = useImagesHook();
  const {getActiveSpotsObj, getSpotsWithImages} = useSpots();

  const dispatch = useDispatch();

  const activeSpotsObj = getActiveSpotsObj();
  const activeSpots = Object.values(activeSpotsObj);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});
  const [isReverseSort, setIsReverseSort] = useState(false);
  const [spotsSearched, setSpotsSearched] = useState(activeSpots);
  const [spotsSorted, setSpotsSorted] = useState(activeSpots);
  const [textNoSpots, setTextNoSpots] = useState('No Spots in Active Datasets');

  let sortedSpotsWithImages = [];

  useEffect(() => {
    // console.log('UE ImageGallery []');
    getImageThumbnailURIs().catch(err => console.error(err));
  }, []);

  const getImageThumbnailURIs = async () => {
    try {
      const spotsWithImages = getSpotsWithImages();
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
    sortedSpotsWithImages = spotsSorted.filter(spot => !isEmpty(spot.properties.images));
    if (isReverseSort) sortedSpotsWithImages = sortedSpotsWithImages.reverse();
    let count = 0;
    const spotsAsSections = sortedSpotsWithImages.reduce((acc, spot) => {
      count += spot.properties.images.length;
      return [...acc, {spot: spot, data: [spot.properties.images]}];
    }, []);

    return (
      <>
        <SpotFilters
          activeSpots={activeSpots}
          setIsReverseSort={setIsReverseSort}
          setSpotsSearched={setSpotsSearched}
          setSpotsSorted={setSpotsSorted}
          setTextNoSpots={setTextNoSpots}
          spotsSearched={spotsSearched}
          updateSpotsInMapExtent={updateSpotsInMapExtent}
        />
        <View style={imageStyles.galleryImageContainer}>
          <SectionDivider dividerText={count + (count === 1 ? ' Image' : ' Images') + ' in active Spots'}/>
          <SectionList
            keyExtractor={(item, index) => item + index}
            sections={spotsAsSections}
            renderSectionHeader={({section}) => renderSectionHeader(section)}
            renderItem={({item}) => renderImagesInSpot(item)}
            ListEmptyComponent={<ListEmptyText text={textNoSpots + ' with images found'}/>}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </>
    );
  };

  return (
    <>
      {isEmpty(getSpotsWithImages()) ? renderNoImagesText()
        : !isError ? renderSpotsWithImages()
          : renderError()}
    </>
  );
};

export default ImageGallery;
