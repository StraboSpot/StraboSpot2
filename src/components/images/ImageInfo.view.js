import React, {useState} from 'react';
import {ActivityIndicator, Button, Text, View} from 'react-native';
import styles from './images.styles';
import {connect} from "react-redux";
import {Icon, Image} from "react-native-elements";
import {Navigation} from "react-native-navigation";
import IconButton from '../../shared/ui/IconButton';
import {imageReducers} from "./Image.constants";
import ImageNoteModal from './ImageNoteModal';

const ImageInfoView = (props) => {
  console.log('Image Info', props);

  const [imageNoteModal, setImageNoteModal] = useState(false);

  let noteModal = (
    <View style={styles.modalPosition}>
      <ImageNoteModal
        close={() => closeModal()}
      >
        Image Info
      </ImageNoteModal>
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
          onPress={() => Navigation.push(props.componentId, {
            component: {
              name: 'Home'
            }
          })}
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
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image})
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageInfoView);
