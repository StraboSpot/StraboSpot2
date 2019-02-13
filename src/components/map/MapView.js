import React, {Component} from 'react';
import {StyleSheet} from "react-native";
import Mapbox from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {goToImages, goSignIn, goToDownloadMap} from '../../routes/Navigation';

Mapbox.setAccessToken(
  'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg');

class mapView extends Component {

  state = {
    lng: -110.867528,
    lat: 32.299329,
    images: [],
    map: {}
  };

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        console.log('this.map', this.map);
        const visibleBounds = await this.map.getVisibleBounds();
        console.log('first bounds', visibleBounds);
        goToDownloadMap(visibleBounds);
        break;
      case "Track":
        console.log("Tracked selected");
        break;
      case "Images":
        console.log("images selected");
        goToImages();
        break;
      case "Signout":
        goSignIn();
        break;
    }
  };

  render() {

    const actions = [
      {
        text: 'Download Map',
        icon: require('../../assets/icons/download.png'),
        name: 'Download Map',
        position: 1,
        color: "white"
      },
      {
        text: 'Images',
        icon: require('../../assets/icons/images.png'),
        name: 'Images',
        position: 3,
        color: "white"
      },
      {
        text: 'Signout',
        icon: require('../../assets/icons/logout.png'),
        name: 'Signout',
        position: 4,
        color: "white"
      },
    ];

    return (
      <React.Fragment>
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Street}
          zoomLevel={15}
          centerCoordinate={[this.state.lng, this.state.lat]}
          style={styles.mapContainer}
          showUserLocation={true}
          ref={ref => this.map = ref}
        >
        </Mapbox.MapView>
        <FloatingAction
          position={"center"}
          distanceToEdge={10}
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
  }
});


export default mapView;