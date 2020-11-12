import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Image} from 'react-native-elements';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from './ImagePropertiesModal';
import styles from './images.styles';
import useImagesHook from './useImages';

const ImageInfo = (props) => {
  const [isImagePropertiesModalVisible, setIsImagePropertiesModalVisible] = useState(false);
  const [imageProps] = useState(props.route.params.imageId);
  const [useImages] = useImagesHook();
  const navigation = useNavigation();

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

  return (
    <View>
      <Image
        source={{uri: useImages.getLocalImageURI(imageProps)}}
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
      </View>
    </View>
  );
};

export default ImageInfo;
