import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
//import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {goToImages, goSignIn, goToDownloadMap} from '../../routes/Navigation';
import MapView, {MAP_TYPES, PROVIDER_DEFAULT, ProviderPropType, UrlTile} from 'react-native-maps';

/*MapboxGL.setAccessToken(
  'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg');*/

const MAPBOX_KEY = 'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 32.299329;
const LONGITUDE = -110.867528;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class mapView extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      currentBaseMap: {
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      images: [],
      location: false,
    };

    this.basemaps = {
      osm: {
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 16
      },
      macrostrat: {
        url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
        maxZoom: 19
      },
      mapboxOutdoors: {
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      mapboxSatellite: {
        url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      }
    }
  }

  get mapType() {
    // MapKit does not support 'none' as a base map
    if (Platform.OS === 'ios'){
      return this.props.provider === PROVIDER_DEFAULT ?
        MAP_TYPES.STANDARD : MAP_TYPES.MUTEDSTANDARD;
    } else {
      return this.props.provider === PROVIDER_DEFAULT ?
        MAP_TYPES.STANDARD : MAP_TYPES.NONE;
    }

  }

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        console.log('this.map', this.map);
        const visibleBounds = await this.map.getMapBoundaries();
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


  // To add a spot pin. Location is selected when user picks point on map
  pickLocationHandler = event => {
    const coords = event.nativeEvent.coordinate;
    console.log(coords)
  };

  changeMap = (mapName) => {
    if (mapName === "satellite") {
      this.setState({
        currentBaseMap: {
          url: this.basemaps.mapboxSatellite.url,
          maxZoom: this.basemaps.mapboxSatellite.maxZoom
        }
      })
    }
    if (mapName === "topo") {
      this.setState({
        currentBaseMap: {
          url: this.basemaps.mapboxOutdoors.url,
          maxZoom: this.basemaps.mapboxOutdoors.maxZoom
        }
      })
    }
    if (mapName === "streets") {
      this.setState({
        currentBaseMap: {
          url: this.basemaps.osm.url,
          maxZoom: this.basemaps.osm.maxZoom
        }
      })
    }
    if (mapName === "macrostrat") {
      console.log("MAP 4", mapName)
    }
    if (mapName === "geo&roads") {
      console.log("MAP 5", mapName)
    }
  };

  getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coordsEvent = {
          nativeEvent: {
            coordinate: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              latitudeDelta: 0.1229,
            }
          }
        };
        const coords = coordsEvent.nativeEvent.coordinate;
        this.map.animateToRegion({
          ...this.state.region,
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        this.setState(prevState => {
          return {
            region: {
              ...prevState.region,
              latitude: coords.latitude,
              longitude: coords.longitude,
              longitudeDelta: .0122,
              latitudeDelta: LATITUDE_DELTA,
            },
            locationChosen: true
          };
        });
      })
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
        <View style={styles.container}>
          <MapView
            provider={this.props.provider}
            mapType={this.mapType}
            style={styles.map}
            initialRegion={this.state.region}
            rotateEnabled={false}
            showsUserLocation={true}
            ref={ref => this.map = ref}
            onPress={this.pickLocationHandler}
          >
            <UrlTile
              urlTemplate={this.state.currentBaseMap.url}
              maximumZ={this.state.currentBaseMap.maxZoom}
            />
          </MapView>
        </View>
        {/*        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Street}
          zoomLevel={15}
          centerCoordinate={[this.state.lng, this.state.lat]}
          style={styles.mapContainer}
          showUserLocation={true}
          ref={ref => this.map = ref}
        >
        </MapboxGL.MapView>*/}
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

mapView.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default mapView;
