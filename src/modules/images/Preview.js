import React, {useState} from 'react';
import {ActivityIndicator, Dimensions, Image, Platform, TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from '../images/ImagePropertiesModal';
import {PAGE_KEYS} from '../page/page.constants';
import {setSelectedAttributes, setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import styles from './images.styles';

const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const height = Dimensions.get(platform).height;
const width = Dimensions.get(platform).width;

const Preview = (props) => {
  const [useSpots] = useSpotsHook();
  const spots = useSelector(state => state.spot.spots);
  const [imageNoteModal, setImageNoteModal] = useState(false);
  const [buttonsDisplay, setButtonsDisplay] = useState(false);
  const [disable, setDisable] = useState(false);
  const dispatch = useDispatch();

  const closeModal = () => {
    setImageNoteModal(false);
  };

  const getSpotFromId = (spotId) => {
    props.toggle();
    const spot = spots[spotId];
    props.openNotebookPanel(PAGE_KEYS.OVERVIEW);
    dispatch(setSelectedSpot(spot));
  };

  const updateImage = (item) => {
    setDisable(true);
    dispatch(setSelectedAttributes([item.image]));
    setImageNoteModal(true);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[{height: props.height, width: props.width}]}
      onPress={() => setButtonsDisplay(!buttonsDisplay)}>
      <View style={{backgroundColor: 'black'}}>
        <Image
          source={{uri: props.item.uri}}
          resizeMode={'contain'}
          style={[{width: width, height: height}]}
          PlaceholderContent={<ActivityIndicator/>}
        />
      </View>
      {imageNoteModal && (
        <ImagePropertiesModal
          close={() => closeModal()} // Saves and closes modal
          cancel={() => closeModal()} // Closes without saving
        />
      )}
      {buttonsDisplay && <View style={{}}>
        <View style={{position: 'absolute', right: 10, bottom: height * 0.90}}>
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/Close.png')}
            onPress={() => props.toggle()}
          />
        </View>
        <View style={styles.rightsideIcons}>
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/NoteButton.png')}
            onPress={() => updateImage(props.item)}
          />
          <IconButton
            style={styles.imageInfoButtons}
            source={require('../../assets/icons/NotebookNavButton.png')}
            onPress={() => {
              setImageNoteModal(false);
              getSpotFromId(useSpots.getSpotByImageId(props.item.image.id).properties.id);
            }}
          />
        </View>
      </View>}
    </TouchableOpacity>
  );
};

export default Preview;
