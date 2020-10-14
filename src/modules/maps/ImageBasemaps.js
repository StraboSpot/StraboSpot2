import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';

import {connect, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import attributesStyles from '../main-menu-panel/attributes.styles';
import {SortedViews} from '../main-menu-panel/mainMenuPanel.constants';
import useSpotsHook from '../spots/useSpots';
import {mapReducers} from './maps.constants';
import {setSelectedButtonIndex, setSortedView} from '../main-menu-panel/mainMenuPanel.slice';

const ImageBaseMaps = (props) => {
  const dispatch = useDispatch();
  const sortedListView = useSelector(state => state.mainMenu.sortedView)
  const [useSpots] = useSpotsHook();
  const activeSpotsObj = useSpots.getActiveSpotsObj();
  const [imageBaseMapSet, setImageBaseMapsSet] = useState(useSpots.getAllImageBaseMaps());
  const [useImages] = useImagesHook();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    return function cleanUp() {
      dispatch(setSortedView({view: SortedViews.CHRONOLOGICAL}));
      dispatch(setSelectedButtonIndex({index: 0}));
      console.log('CLEANUP!');
    };
  }, []);

  useEffect(() => {
    // setSortedList(Object.values(activeSpotsObj));
    setImageBaseMapsSet(useSpots.getAllImageBaseMaps());
  }, [props.selectedSpot, props.spots, sortedListView]);

  const renderName = (item) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {item.title}
          </Text>
        </View>
        <FlatList

          data={imageBaseMapList.filter(obj => {
            return obj.id === item.id;
          })}
          numColumns={3}
          renderItem={({item}) => renderImageBaseMap(item)}
        />
      </View>
    );
  };

  const renderImageBaseMap = (image) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.thumbnail}
          onPress={() => openImageBaseMap(image)}
        />
      </View>
    );
  };

  const openImageBaseMap = (imageBasemap) => {
    // Calling map reducer to update the state
    console.log('trying to update imagebasemap', imageBasemap);
    props.updateImageBasemap(imageBasemap);
  };

  let sortedView = null;
  const imageBaseMapList = Array.from(imageBaseMapSet);
  if (!isEmpty(imageBaseMapList)) {
    sortedView = <FlatList
      keyExtractor={(item) => item.id.toString()}
      extraData={refresh}
      data={imageBaseMapList}
      renderItem={({item}) => renderName(item)}
    />;
    return (
      <React.Fragment>
        <View style={imageStyles.galleryImageContainer}>
          {sortedView}
        </View>
      </React.Fragment>
    );
  }
  else {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Image-Basemaps found</Text>
      </View>
    );
  }
};

const mapStateToProps = (state) => {
  if (!isEmpty(state.spot.spots)) {
    return {
      selectedSpot: state.spot.selectedSpot,
      spots: state.spot.spots,
    };
  }
};

const mapDispatchToProps = {
  updateImageBasemap: (currentImageBasemap) => ({
    type: mapReducers.CURRENT_IMAGE_BASEMAP,
    currentImageBasemap: currentImageBasemap,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageBaseMaps);
