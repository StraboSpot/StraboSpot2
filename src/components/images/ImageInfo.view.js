import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {connect} from 'react-redux';
import {Icon, Image} from 'react-native-elements';

import IconButton from '../../shared/ui/IconButton';
import ImagePropertiesModal from './ImagePropertiesModal';

// Constants
import {homeReducers} from '../../views/home/Home.constants';

// Hooks
import useImagesHook from './useImages';

// Styles
import styles from './images.styles';

const ImageInfoView = (props) => {
  // console.log('Image Info', props);

  const [imageNoteModal, setImageNoteModal] = useState(false);
  const [useImages] = useImagesHook();

  // useEffect(() => {
  //   getDims = Dimensions.get('window');
  //   props.setDeviceDims(getDims);
  //   function dimsChange() {
  //     getDims = Dimensions.get('window');
  //     props.setDeviceDims(getDims);
  //   }
  //   Dimensions.addEventListener('change', dimsChange);
  //   return () => {
  //     Dimensions.removeEventListener('change', dimsChange);
  //     console.log('Dims listener removed')
  //   }
  // },[props.getDeviceDims]);

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
          color={'white'}
          size={42}
          onPress={() => {
            props.navigation.goBack();
          }}
        />
      </View>
      <View style={styles.rightsideIcons}>
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/StraboIcons_Oct2019/NoteButton.png')}
          onPress={() => setImageNoteModal(true)}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/StraboIcons_Oct2019/SketchButton.png')}
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
export default connect(mapStateToProps, mapDispatchToProps)(ImageInfoView);
