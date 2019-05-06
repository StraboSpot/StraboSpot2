import React, {Component} from 'react';
import {
  Button,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  Modal,
  StyleSheet,
} from 'react-native';
import {Navigation} from "react-native-navigation";
import {getRemoteImages, getImages} from '../../services/images/ImageDownload';
import ImageView from '../../components/images/ImageView';
import PhotoGrid from 'react-native-image-grid';
import {connect} from 'react-redux';


// const w = Dimensions.get('window');

class Images extends Component {
  _isMounted = false;

  constructor(props) {
    console.log(props)
    super(props);
    this.state = {
      imageuri: '',
      ModalVisibleStatus: false
    }
    this.state = {
      // imagesToDisplay: []
      items: []
    };
  }


  async componentDidMount() {
    this._isMounted = true;

    // const images = await this.props.getImages;
    // this.setState({items: images}, () => console.log('Image State:', this.state.items))
    // getRemoteImages().then(() => {
    //   console.log("Finished getting images!");
    //   this.setState({
    //     imagesToDisplay: getImages()
    //   });
    //   console.log("State", this.state.imagesToDisplay);
    // })

    // getRemoteImages()
    // .then(() => {
    // var that = this;
    // let items = getImages();
    // let items = Array.apply(null, Array(60)).map((v, i) => {
    //   //Using demo placeholder images but you can add your images here
    //   return {id: i, src: 'http://placehold.it/200x200?text=' + (i + 1)};
    // });
    // that.setState({items});
    // console.log(that.state.items)
    // })

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static renderHeader() {
    //Header of the Screen
    return <Text style={{padding: 16, fontSize: 20, color: 'white', backgroundColor: 'green'}}>
      Image Gallery
    </Text>;
  }

  ShowModalFunction(visible, imageURL) {
    //handler to handle the click on image of Grid
    //and close button on modal
    this.setState({
      ModalVisibleStatus: visible,
      imageuri: imageURL,
    });
  }

  renderItem(item, itemSize, itemPaddingHorizontal) {
    //Single item of Grid
    // return (
    //   <TouchableOpacity
    //     key={props.getImages.id}
    //     style={{
    //       width: itemSize,
    //       height: itemSize,
    //       paddingHorizontal: itemPaddingHorizontal,
    //     }}
    //     onPress={() => {
    //       this.ShowModalFunction(true, item.src);
    //     }}>
    //     <Image
    //       resizeMode="cover"
    //       style={{flex: 1}}
    //       source={{uri: item.src}}
    //     />
    //   </TouchableOpacity>
    // );
  }

  render() {
    //   if (this.state.ModalVisibleStatus) {
    //     //Modal to show full image with close button
    //     return (
    //       <Modal
    //         transparent={false}
    //         animationType={'fade'}
    //         visible={this.state.ModalVisibleStatus}
    //         onRequestClose={() => {
    //           this.ShowModalFunction(!this.state.ModalVisibleStatus, '');
    //         }}>
    //         <View style={styles.modelStyle}>
    //           <Image
    //             style={styles.fullImageStyle}
    //             source={{uri: this.state.imageuri}}
    //           />
    //           <TouchableOpacity
    //             activeOpacity={0.5}
    //             style={styles.closeButtonStyle}
    //             onPress={() => {
    //               this.ShowModalFunction(!this.state.ModalVisibleStatus, '');
    //             }}>
    //             <Image
    //               source={{
    //                 uri:
    //                   'https://aboutreact.com/wp-content/uploads/2018/09/close.png',
    //               }}
    //               style={{width: 25, height: 25, marginTop: 16}}
    //             />
    //           </TouchableOpacity>
    //         </View>
    //       </Modal>
    //     );
    //   }
    //   else {
    //     //Photo Grid of images
    //     return (
    //     <View style={styles.containerStyle}>
    //       <PhotoGrid
    //
    //         data={this.state.items}
    //         itemsPerRow={3}
    //         //You can decide the item per row
    //         itemMargin={1}
    //         itemPaddingHorizontal={1}
    //         renderHeader={this.renderHeader}
    //         renderItem={this.renderItem}
    //       />
    //       <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center'}}>
    //         <Button
    //           onPress={() => Navigation.push(this.props.componentId, {
    //             component: {
    //               name: 'Home'
    //             }
    //           })}
    //           title="Go Home"
    //         />
    //         <Button
    //           onPress={() => Navigation.pop(this.props.componentId)}
    //           title="Go Back"
    //         />
    //       </View>
    //     </View>
    //   );
    //   }
    // }


//   render() {
    return (
      <View style={styles.container}>
        <Text>Images Page</Text>
          <FlatList
            data={this.props.getImages}
            renderItem={({item}) => <Image style={styles.imageList} source={{uri: item.src}}/>}
            // style={styles.imageList}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
          />

        <Button
          onPress={() => Navigation.push(this.props.componentId, {
            component: {
              name: 'Home'
            }
          })}
          title="Go Back"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  // images: {
  //   width: 200,
  //   height: 200,
  //   margin: 10
  // },
  imageList: {
    // flex: 1,
    height: 200,
    width: 200,
    margin: 15
    // paddingTop: 50,
  },

  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
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
    getImages: state.images.imagePaths
  }
};

export default connect(mapStateToProps)(Images);
