import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Image} from 'react-native-elements';
import {connect} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import {homeReducers} from '../home/home.constants';
import ImagePropertiesModal from './ImagePropertiesModal';
import styles from './images.styles';
import useImagesHook from './useImages';

const ImageInfo = (props) => {
  const [imageNoteModal, setImageNoteModal] = useState(false);
  const [imageProps] = useState(props.route.params.imageId);
  const [useImages] = useImagesHook();
  const navigation = useNavigation();

  let noteModal = (
    <View style={styles.modalPosition}>
      <ImagePropertiesModal
        close={() => closeModal()} // Saves and closes modal
        cancel={() => closeModal()} // Closes without saving
      >
        Image Info
      </ImagePropertiesModal>
    </View>
  );

  const clickHandler = (name) => {
    console.log(name);
    switch (name) {
      case 'sketch':
        navigation.navigate('Sketch', {imageId: imageProps});
        break;
    }
  };

  const closeModal = () => {
    setImageNoteModal(false);
  };

  return (
    <View>
      <Image
        source={{uri: useImages.getLocalImageURI(imageProps)}}
        style={{width: '100%', height: '100%'}}
        PlaceholderContent={<ActivityIndicator/>}
      />
      {imageNoteModal ? noteModal : null}
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
          onPress={() => setImageNoteModal(true)}
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

const mapStateToProps = (state) => {
  // console.log('MP to P', state);
  return {
    getDeviceDims: state.home.deviceDimensions,
  };
};

const mapDispatchToProps = {
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageInfo);
