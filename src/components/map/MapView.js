import React, {Component} from 'react';
import {StyleSheet, View} from "react-native";
import Mapbox from '@mapbox/react-native-mapbox-gl';

Mapbox.setAccessToken(
  'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg');

class mapView extends Component {
  state = {
    lng: -110.867528,
    lat: 32.299329
  };

  render() {
    return(
      <View style={styles.container}>
      <Mapbox.MapView
        styleURL={Mapbox.StyleURL.Dark}
        zoomLevel={15}
        centerCoordinate={[this.state.lng, this.state.lat]}
        style={styles.mapContainer}
        showUserLocation={true}
      >
      </Mapbox.MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  mapContainer: {
    width: '90%',
    height: 500
  }
});

export default mapView;