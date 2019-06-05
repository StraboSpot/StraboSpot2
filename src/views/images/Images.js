import React, {Component} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Navigation} from "react-native-navigation";
import {getRemoteImages, getImages, saveFile} from '../../services/images/ImageDownload';
import {connect} from 'react-redux';
import ImagePicker from "react-native-image-picker";
import {ADD_PHOTOS, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";


// const w = Dimensions.get('window');

class Images extends Component {
  _isMounted = false;

  constructor(props) {
    // console.log(props)
    super(props);
    this.state = {
      allPhotosSaved: [],
      imageURI: '',
      ModalVisibleStatus: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  ShowModalFunction(visible, imageURL) {
    //handler to handle the click on image of Grid
    //and close button on modal
    this.setState({
      ModalVisibleStatus: visible,
      imageURI: imageURL,
    });
  }

  renderImages = () => {
    let imagePath = null;
    console.log('Image in Images.js', this.props.imagePaths)

    Object.values(this.props.imagePaths).map(image => {
      console.log('IMAGES!', image)
      imagePath = <Text >{image}</Text>
    })
    return imagePath
  };

  pictureSelectDialog = () => {
    let savedArr = this.state.allPhotosSaved;
    console.log('ALLPHOTOSSAVEDARR', this.state.allPhotosSaved)
    const imageOptions = {
      storageOptions: {
        skipBackup: true,
      },
      title: 'Choose Photo Source'
    };

    ImagePicker.showImagePicker(imageOptions, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        if (this.state.allPhotosSaved.length > 0) {
          console.log('ALL PHOTOS SAVED', this.state.allPhotosSaved);
          this.props.addPhoto(this.state.allPhotosSaved);
          this.state.allPhotosSaved = [];
          Alert.alert('Photo Saved!', 'Thank you!')
        }
        else {
          Alert.alert('No Photos To Save', 'please try again...')
        }
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        const savedPhoto = await saveFile(response);
        this.setState(prevState => {
          return {
            ...prevState,
            allPhotosSaved: [...this.state.allPhotosSaved, savedPhoto]
          }
        }, () => {
          console.log('Saved Photo in imageURI= ', this.state.allPhotosSaved);
          this.pictureSelectDialog();
        });
      }
    });
  };


  render() {

    return (
      <View style={styles.container}>
        <Text style={{margin: 30,
        }}>Images Page</Text>
        <ScrollView contentContainerstyle={styles.imageContainer}>

          <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'space-around'}}>
            {Object.values(this.props.imagePaths).map(image => {
              return <Image key={image} style={styles.image} source={{uri: image}}/>
            })}
            {/*<View style={{width: 50, height: 50, margin: 10, backgroundColor: 'powderblue'}} />*/}
            {/*<View style={{width: 50, height: 50, margin: 10,backgroundColor: 'skyblue'}} />*/}
            {/*<View style={{width: 50, height: 50, margin: 10,backgroundColor: 'steelblue'}} />*/}
          </View>
        </ScrollView>

        {/*<View style={styles.imageContainer}>*/}
        {/*<ScrollView >*/}
        {/*{   Object.values(this.props.imagePaths).map(image => {*/}
        {/*    return <Image key={image} style={styles.image} source={{uri: image}}/>*/}
        {/*})}*/}
        {/*</ScrollView>*/}
        {/*</View>*/}
        {/*<FlatList*/}
        {/*  data={Object.values(this.props.imagePaths)}*/}
        {/*  renderItem={this.renderImage}*/}
        {/*  style={styles.flatListStyle}*/}
        {/*  numColumns={2}*/}
        {/*  keyExtractor={(item) => item.item}*/}
        {/*/>*/}

        <Button
          onPress={() => Navigation.push(this.props.componentId, {
            component: {
              name: 'Home'
            }
          })}
          title="Go Back"
        />
        <Button
          onPress={() => this.pictureSelectDialog()}
          title="Picture"
        />
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e0d2',
  },
  imageContainer: {
    // // flex: 1,
    // flexDirection: 'row',
    // flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center'
  },
  image: {
    height: 300,
    width: (Dimensions.get('window').width / 2) - 40,
    // width: 200,
    margin: 10
    // paddingTop: 50,
  },

  flatListStyle: {
    flex: 1
  },
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '98%',
    resizeMode: 'contain',
  },
  modelStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButtonStyle: {
    width: 25,
    height: 25,
    top: 9,
    right: 9,
    position: 'absolute',
  },
});

const mapStateToProps = (state) => {
  console.log('MP to P', state)
  return {
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: ADD_PHOTOS, images: image})
};

export default connect(mapStateToProps, mapDispatchToProps)(Images);
