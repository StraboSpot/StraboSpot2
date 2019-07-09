import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Button, Dimensions, Platform, Text, View} from 'react-native';
import styles from './images.styles';
import {connect} from "react-redux";
import {Icon, Image} from "react-native-elements";
import {Navigation} from "react-native-navigation";
import IconButton from '../../shared/ui/IconButton';
import {imageReducers} from "./Image.constants";
import ImagePropertiesModal from './ImagePropertiesModal';
import {homeReducers} from "../../views/home/Home.constants";

const platformType = Platform.OS === 'ios' ? 'window': 'screen';
let getDims = Dimensions.get(platformType);

const ImageInfoView = (props) => {
  // console.log('Image Info', props);

  const [imageNoteModal, setImageNoteModal] = useState(false);

  useEffect(() => {
    getDims = Dimensions.get(platformType);
    props.setDeviceDims(getDims);
    function dimsChange() {
      getDims = Dimensions.get(platformType);
      props.setDeviceDims(getDims);
    };
    Dimensions.addEventListener('change', dimsChange);
    return () => {
      Dimensions.removeEventListener('change', dimsChange);
      console.log('Dims listener removed')
    }
  },[props.getDeviceDims]);

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
    console.log(name)
  };

  const closeModal = () => {
    setImageNoteModal(false)
  };

  const getImageSrc = (id) => {
    return props.imagePaths[id];
  };

  return (
    <View>
      <Image
        source={{uri: getImageSrc(props.id)}}
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
            Navigation.push(props.componentId, {
            component: {
              name: 'Home'
            }
          })}}
        />
      </View>
      <View style={styles.rightsideIcons}>
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/app-icons-shaded/NoteButton.png')}
          onPress={() => setImageNoteModal(true)}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/app-icons-shaded/SketchButton.png')}
          onPress={() => clickHandler('sketch')}
        />
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  // console.log('MP to P', state);
  return {
    imagePaths: state.images.imagePaths,
    getDeviceDims: state.home.deviceDimensions
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image}),
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageInfoView);
