import React, {useState} from 'react';
import {ActivityIndicator, Alert, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import useSpotsHook from '../spots/useSpots';
import ImagePropertiesModal from './ImagePropertiesModal';
import styles from './images.styles';
import useImagesHook from './useImages';

const ImageInfo = (props) => {
  const dispatch = useDispatch();
  const [isImagePropertiesModalVisible, setIsImagePropertiesModalVisible] = useState(false);
  const [imageProps] = useState(props.route.params.imageId);
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();
  const navigation = useNavigation();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);

  const clickHandler = (name) => {
    console.log(name);
    switch (name) {
      case 'sketch':
        navigation.navigate('Sketch', {imageId: imageProps});
        break;
    }
  };

  const closeModal = () => {
    setIsImagePropertiesModalVisible(false);
  };

  const deleteImage = async (imageId) => {
    const isImageDeleted = await useImages.deleteImage(imageId, useSpots.getSpotByImageId(imageId));
    if (isImageDeleted) {
      navigation.goBack();
    }
  };

  return (
    <View style={{backgroundColor: 'black'}}>
      <Image
        source={{uri: useImages.getLocalImageURI(imageProps)}}
        resizeMode={'contain'}
        style={{width: '100%', height: '100%'}}
        PlaceholderContent={<ActivityIndicator/>}
      />
      {isImagePropertiesModalVisible && (
        <ImagePropertiesModal
          close={() => closeModal()} // Saves and closes modal
          cancel={() => closeModal()} // Closes without saving
        />
      )}
      <View style={styles.closeButtonContainer}>
        <IconButton
          source={require('../../assets/icons/Close.png')}
          onPress={() => navigation.goBack()}
          style={styles.closeButtonStyle}
        />
      </View>
      <View style={styles.rightsideIcons}>
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/NoteButton.png')}
          onPress={() => setIsImagePropertiesModalVisible(true)}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/SketchButton.png')}
          onPress={() => clickHandler('sketch')}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/DeleteButton.png')} onPress={() =>
          Alert.alert(
            'Deleting image ' + imageProps, 'Are you sure you want to delete image ' + imageProps,
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK', onPress: () => deleteImage(imageProps),
              },
            ],
            {cancelable: false},
          )}
        />
      </View>
    </View>
  );
};

export default ImageInfo;
