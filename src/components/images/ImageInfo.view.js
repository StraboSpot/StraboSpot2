import React from 'react';
import {ActivityIndicator, Button, Text, View} from 'react-native';
import styles from './images.styles';
import {connect} from "react-redux";
import {Icon, Image} from "react-native-elements";
import {Navigation} from "react-native-navigation";
import * as actionCreators from "../../store/actions";
import IconButton from '../../shared/ui/IconButton';

const ImageInfoView = (props) => {
  console.log('Image Info', props)

  const clickHandler = (name) => {
    console.log(name)
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
          onPress={() => clickHandler('note')}
        />
        <IconButton
          style={styles.imageInfoButtons}
          source={require('../../assets/icons/app-icons-shaded/SketchButton.png')}
          onPress={() => clickHandler('sketch')}
        />
      {/*<Button*/}
      {/*  onPress={() => Navigation.push(props.componentId, {*/}
      {/*    component: {*/}
      {/*      name: 'Home'*/}
      {/*    }*/}
      {/*  })}*/}
      {/*  title="Go Back"*/}
      {/*/>*/}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  console.log('MP to P', state);
  return {
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => (actionCreators.addPhoto(image))
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageInfoView);
