import React from 'react';
import {Alert, FlatList, Pressable, SectionList, View} from 'react-native';

import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import uiStyles from '../../shared/ui/ui.styles';
import {setImageModalVisible, setLoadingStatus} from '../home/home.slice';
import {SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
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
      .catch((e) => console.error('Image not found', e));
  };

  const renderImagesInSpot = (images) => {
    return (
      <FlatList
        keyExtractor={(image) => image.id}
        data={images}
        numColumns={3}
        renderItem={({item}) => renderImage(item)}
      />
    );
  };

  const renderImage = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Pressable onPress={() => handleImagePressed(image)}>
          {({pressed}) => (
            <FastImage
              style={[imageStyles.thumbnail, {opacity: pressed ? 0.5 : 1}]}
              source={{
                uri: useImages.getLocalImageURI(image.id),
                priority: FastImage.priority.high,
              }}
            />
          )}
        </Pressable>
      </View>
    );
  };

  const renderNoImagesText = () => {
    return <ListEmptyText text={'No Images in Active Datasets'}/>;
  };

  const renderSectionHeader = ({spot}) => {
    return (
      <View style={uiStyles.sectionHeaderBackground}>
        <SectionDividerWithRightButton
          dividerText={spot.properties.name}
          buttonTitle={'View In Spot'}
          onPress={() => props.openSpotInNotebook(spot, NOTEBOOK_PAGES.IMAGE)}
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
      {isEmpty(useSpots.getSpotsWithImages()) ? renderNoImagesText() : renderSpotsWithImages()}
    </React.Fragment>
  );
};

export default ImageGallery;
