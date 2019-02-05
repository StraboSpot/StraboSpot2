import React, {Component} from 'react';
import {StyleSheet} from "react-native";
import Mapbox from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {getImages, downloadToDevice} from '../../images/ImageDownload';
import {goToImages} from '../../Navigation';
import {Navigation} from "react-native-navigation";

Mapbox.setAccessToken(
  'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg');

class mapView extends Component {

  state = {
    lng: -110.867528,
    lat: 32.299329,
    images: []
  };

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        getImages();
        break;
      case "Track":
        console.log("Tracked selected");
        break;
      case "Images":
        console.log("images selected");
        goToImages();
        break;
    }
  };

  getImages = async () => {
    const downloadedImages = await getImages();
    const imageURI = downloadedImages.map(res => res.URI);
    this.setState({images: imageURI});
    // console.log("State", this.state.images)
    downloadToDevice();
  };


  render() {

    const actions = [{
      text: 'Download Map',
      icon: require('../../../assets/download.png'),
      name: 'Download Map',
      position: 1,
      color: "white"
    },
      {
        text: 'Track',
        icon: require('../../../assets/logout.png'),
        name: 'Track',
        position: 2,
        color: "white"
      },
      {
        text: 'Images',
        icon: require('../../../assets/images.png'),
        name: 'Images',
        position: 3,
        color: "white"
      }
    ];

    return (
      <React.Fragment>
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Light}
          zoomLevel={15}
          centerCoordinate={[this.state.lng, this.state.lat]}
          style={styles.mapContainer}
          showUserLocation={true}
          compassEnabled={true}
        >
        </Mapbox.MapView>
        <FloatingAction
          position={"left"}
          distanceToEdge={30}
          actions={actions}
          onPressItem={this.handlePress}
        />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: 700,
  }
});


export default mapView;