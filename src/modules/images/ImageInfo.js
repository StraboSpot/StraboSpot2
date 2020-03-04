import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {connect} from 'react-redux';
import {Icon, Image} from 'react-native-elements';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from './ImagePropertiesModal';

// Constants
import {homeReducers} from '../home/home.constants';

// Hooks
import useImagesHook from './useImages';

// Styles
import styles from './images.styles';
import * as themes from '../../shared/styles.constants';

const ImageInfo = (props) => {

  const [imageNoteModal, setImageNoteModal] = useState(false);
  const [useImages] = useImagesHook();

  let noteModal = (
    <View style={styles.modalPosition}>
      <ImagePropertiesModal
        close={() => closeModal()}
      >
        Image Info
      </ImagePropertiesModal>
    </View>
  );

  const clickHandler = (name) => {
    console.log(name);
  };

  const closeModal = () => {
    setImageNoteModal(false);
  };

  return (
    <View>
      <Image
        source={{uri: useImages.getLocalImageSrc(props.navigation.getParam('imageId', 'No-ID'))}}
        style={{width: '100%', height: '100%'}}
        PlaceholderContent={<ActivityIndicator/>}
      />
      {imageNoteModal ? noteModal : null}
      <View style={styles.closeInfoView}>
        <Icon
          name={'close'}
          type={'antdesign'}
          color={themes.BLUE}
          size={35}
          onPress={() => {
            props.navigation.goBack();
          }}
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
