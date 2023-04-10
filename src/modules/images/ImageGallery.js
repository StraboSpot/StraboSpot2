import React, {useEffect, useState} from 'react';
import {Alert, FlatList, SectionList, Text, View} from 'react-native';

import {Icon, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setImageModalVisible, setLoadingStatus} from '../home/home.slice';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {PAGE_KEYS} from '../page/page.constants';
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

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    console.log('UE ImageGallery []');
    getImageThumbnailURIs().catch(err => console.error(err));
  }, []);

  const getImageThumbnailURIs = async () => {
    try {
      const spotsWithImages = useSpots.getSpotsWithImages();
      const imageThumbnailURIsTemp = await useImages.getImageThumbnailURIs(spotsWithImages);
      setImageThumbnails(imageThumbnailURIsTemp);
      setIsError(false);
    }
    catch (err) {
      console.error('Error in getImageThumbnailURIs', err);
      setIsError(true);
    }
  };

  const handleImagePressed = (image) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    useImages.doesImageExistOnDevice(image.id)
      .then((doesExist) => {
        if (doesExist) {
          console.log('Opening image', image.id, '...');
          dispatch(setSelectedAttributes([image]));
          dispatch(setImageModalVisible(true));
          dispatch(setLoadingStatus({view: 'home', bool: false}));
        }
        else {
          Alert.alert('Missing Image!', 'Unable to find image file on this device.');
          dispatch(setLoadingStatus({view: 'home', bool: false}));
        }
      })
      .catch(e => console.error('Image not found', e));
  };

  const renderImagesInSpot = (images) => {
    return (
      <FlatList
        keyExtractor={image => image.id}
        data={images}
        numColumns={3}
        renderItem={({item}) => renderImage(item)}
      />
    );
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Image
          style={imageStyles.thumbnail}
          onPress={() => handleImagePressed(image)}
          source={{uri: imageThumbnails[image.id]}}
          PlaceholderContent={
            <Image
              style={imageStyles.thumbnail}
              source={require('../../assets/images/noimage.jpg')}
            />}
          placeholderStyle={{backgroundColor: 'grey'}}
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
          onPress={() => props.openSpotInNotebook(spot, PAGE_KEYS.IMAGES)}
        />
      </View>
    );
  };

  const renderSpotsWithImages = () => {
    let sortedSpotsWithImages = useSpots.getSpotsWithImagesSortedReverseChronologically();
    let noImagesText = 'No Spots with images';
    if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      sortedSpotsWithImages = props.spotsInMapExtent.filter(spot => spot.properties.images);
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
    </React.Fragment>
  );
};

export default ImageGallery;
