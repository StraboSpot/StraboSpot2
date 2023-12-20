import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, Platform, View, useWindowDimensions} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Image} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import ImagePropertiesModal from './ImagePropertiesModal';
import styles from './images.styles';
import useImagesHook from './useImages';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import IconButton from '../../shared/ui/IconButton';
import {WarningModal} from '../home/modals';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSelectedAttributes} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const ImageInfo = (props) => {
  console.log('Rendering ImageInfo...');

  const {width, height} = useWindowDimensions();

  const dispatch = useDispatch();
  const [isImagePropertiesModalVisible, setIsImagePropertiesModalVisible] = useState(false);
  const [imageId] = useState(props.route.params.imageId);
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();
  const navigation = useNavigation();

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageDeleteModalVisible, setIsImageDeleteModalVisible] = useState(false);

  useEffect(() => {
    console.log('UE ImageInfo []');
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  const clickHandler = (name) => {
    console.log(name);
    switch (name) {
      case 'sketch':
        navigation.navigate('Sketch', {imageId: imageId});
        break;
    }
  };

  const handleDeleteImageOnPress = () => {
    setIsImageDeleteModalVisible(true);
  };

  const closeModal = () => {
    setIsImagePropertiesModalVisible(false);
  };

  const deleteImage = async () => {
    setIsImageDeleteModalVisible(false);
    const isImageDeleted = await useImages.deleteImage(imageId, useSpots.getSpotByImageId(imageId));
    if (isImageDeleted) navigation.goBack();
  };

  const renderDeleteImageModal = () => {
    return (
      <WarningModal
        title={'Delete Image?'}
        isVisible={isImageDeleteModalVisible}
        closeModal={() => setIsImageDeleteModalVisible(false)}
        confirmText={'Delete'}
        showConfirmButton
        showCancelButton
        confirmTitleStyle={overlayStyles.importantText}
        onConfirmPress={() => deleteImage()}
      >
        <Text>Are you sure you want to delete image:{'\n'}</Text>
        <Text>{imageId}</Text>
      </WarningModal>
    );
  };

  return (
    <View style={{backgroundColor: 'black'}}>
      <Image
        source={Platform.OS === 'web' ? {uri: useImages.getImageScreenSizedURI(imageId)}
          : {uri: useImages.getLocalImageURI(imageId)}}
        style={Platform.OS === 'web' ? {width: width, height: height}
          : {width: '100%', height: '100%'}}
        resizeMode={'contain'}
        PlaceholderContent={!isImageLoaded ? <ActivityIndicator/>
          : <Image style={styles.thumbnail} source={placeholderImage}/>}
        placeholderStyle={commonStyles.imagePlaceholder}
        onError={() => {
          if (!isImageLoaded) setIsImageLoaded(true);
        }}
        onLoadEnd={() => {
          if (!isImageLoaded) setIsImageLoaded(true);
        }}
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
          source={require('../../assets/icons/ImagePropetiesButton.png')}
          onPress={() => setIsImagePropertiesModalVisible(true)}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/SketchButton.png')}
          onPress={() => clickHandler('sketch')}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/DeleteButton.png')}
          onPress={() => handleDeleteImageOnPress()}
        />
        {renderDeleteImageModal()}
      </View>
    </View>
  );
};

export default ImageInfo;
