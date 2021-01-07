import React, {useState} from 'react';
import {Dimensions, View, TouchableOpacity, Image, ActivityIndicator, Platform} from 'react-native';

import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from '../images/ImagePropertiesModal';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setSelectedSpot, setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import styles from './images.styles';

const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const height = Dimensions.get(platform).height;

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
    props.openNotebookPanel(NOTEBOOK_PAGES.OVERVIEW);
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
      <View>
        <Image
          source={{uri: props.item.uri}}
          style={[{width: wp('100%'), height: hp('100%')}]}
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
