import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {FloatingAction} from 'react-native-floating-action';
import {goToImages, goSignIn, goToDownloadMap} from '../../routes/Navigation';
import MapView, {MAP_TYPES, PROVIDER_DEFAULT, ProviderPropType, UrlTile} from 'react-native-maps';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import {lineString as makeLineString, polygon as makePolygon} from '@turf/helpers';

MapboxGL.setAccessToken(MAPBOX_KEY);

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 32.299329;
const LONGITUDE = -110.867528;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class mapView extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      currentBasemap: {},
      location: false,
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
      drawType: undefined
    };

    this.basemaps = {
      osm: {
        id: 'osm',
        layerId: 'osmLayer',
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 16
      },
      macrostrat: {
        id: 'macrostrat',
        layerId: 'macrostratLayer',
        url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
        maxZoom: 19
      },
      mapboxOutdoors: {
        id: 'mapboxOutdoors',
        layerId: 'mapboxOutdoorsLayer',
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      mapboxSatellite: {
        id: 'mapboxSatellite',
        layerId: 'mapboxSatelliteLayer',
        url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      }
    };

    this.linePoints = [];
    this.map = {};

    this.onMapPress = this.onMapPress.bind(this);
    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    // Set the default basemap
    console.log('Setting initial basemap ...');
    this.setState(prevState => {
      return {
        ...prevState,
        currentBasemap: this.basemaps.mapboxOutdoors
      }
    }, () => {
      console.log('Finished setting initial basemap to:', this.state.currentBasemap);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // For RN Maps
  /*  get mapType() {
      // MapKit does not support 'none' as a base map
      if (Platform.OS === 'ios') {
        return this.props.provider === PROVIDER_DEFAULT ? MAP_TYPES.HYBRID : MAP_TYPES.SATELLITE;
      }
    }*/

  handlePress = async (name) => {
    switch (name) {
      case "Download Map":
        console.log("Download map selected");
        console.log('this.map', this.map);
        const visibleBounds = await this.map.getVisibleBounds();      // Mapbox
        //const visibleBounds = await this.map.getMapBoundaries();    // RN Maps
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

  // RN Maps: To add a spot pin. Location is selected when user picks point on map
  /*  pickLocationHandler = event => {
      const coords = event.nativeEvent.coordinate;
      console.log(coords)
    };*/

  // Mapbox: Handle map press
  async onMapPress(e) {
    if (this.state.drawType === 'point') {
      console.log('Map pressed to create a point', e);
      let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
      this.createFeature(feature);
    }
    else if (this.state.drawType === 'line' || this.state.drawType === 'polygon') {
      console.log('Map pressed to create a line or polygon', e);
      this.linePoints.push(e.geometry.coordinates);
      console.log(this.linePoints);
      if (this.linePoints.length === 1) {
        let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length === 2) {
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        let feature = makeLineString(this.linePoints);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length > 2 && this.state.drawType === 'line') {
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        await this.deleteLastFeature();     // Delete line/polygon
        let feature = makeLineString(this.linePoints);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.linePoints.length > 2 && this.state.drawType === 'polygon') {
        console.log('Creating polygon ...');
        await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
        await this.deleteLastFeature();     // Delete line/polygon
        let feature = makePolygon([[...this.linePoints, this.linePoints[0]]]);
        console.log('feature', feature);
        this.createFeature(feature);
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
    }
    else console.log('Map pressed but no draw type set:', e);
  }

  // Create a new feature in the feature collection
  createFeature = feature => {
    feature.properties.id = '' + Date.now();        // ToDo: Generate unique string id here
    console.log('Creating new feature:', feature);
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          featureCollection: MapboxGL.geoUtils.addToFeatureCollection(this.state.featureCollection, feature)
        }
      }, () => {
        console.log('Finished creating new feature. Features: ', this.state.featureCollection.features);
      });
    }
    else console.log('Attempting to create a new feature but Map View Component not mounted.');
  };

  // Delete the last feature  in the feature collection
  deleteLastFeature = () => {
    if (this._isMounted) {
      console.log('Deleting last feature from', this.state.featureCollection.features);
      this.setState(prevState => {
        prevState.featureCollection.features.pop();
        return {
          ...prevState
        }
      }, () => {
        console.log('Finished deleting last feature. Features:', this.state.featureCollection.features);
      });
    }
    else console.log('Attempting to delete the last feature but Map View Component not mounted.');
  };

  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
  }

  changeMap = (mapName) => {
    if (this._isMounted) {
      if (mapName === 'mapboxSatellite' || mapName === 'mapboxOutdoors' || mapName === 'osm' || mapName === 'macrostrat') {
        console.log('Switching basemap to:', mapName);
        this.setState(prevState => {
          return {
            ...prevState,
            currentBasemap: this.basemaps[mapName]
          }
        }, () => {
          console.log('Current basemap:', this.state.currentBasemap);
        });
      }
      else console.log('Cancel switching basemaps. Basemap', mapName, 'still needs to be setup.');
    }
    else console.log('Attempting to switch basemap to', mapName, 'but MapView Component not mounted.');
  };

  // RN Maps******
  // getCurrentLocation = () => {
  //   navigator.geolocation.getCurrentPosition(
  //     pos => {
  //       const coordsEvent = {
  //         nativeEvent: {
  //           coordinate: {
  //             latitude: pos.coords.latitude,
  //             longitude: pos.coords.longitude,
  //             latitudeDelta: 0.1229,
  //           }
  //         }
  //       };
  //       const coords = coordsEvent.nativeEvent.coordinate;
  //       this.map.animateToRegion({
  //         ...this.state.region,
  //         latitude: coords.latitude,
  //         longitude: coords.longitude
  //       });
  //       this.setState(prevState => {
  //         return {
  //           region: {
  //             ...prevState.region,
  //             latitude: coords.latitude,
  //             longitude: coords.longitude,
  //             longitudeDelta: .0122,
  //             latitudeDelta: LATITUDE_DELTA,
  //           },
  //           locationChosen: true
  //         };
  //       });
  //     })
  // };

  // Set the draw type state to 'point', 'line' or 'polygon' or undefined if none
  setDrawType = async drawType => {
    if (this._isMounted) {
      // If draw types match, drawing canceled
      if (this.state.drawType !== undefined) {
        console.log('Draw canceled');
        if (this.state.drawType === 'line' || this.state.drawType === 'polygon') {
          if (this.linePoints.length >= 1) await this.deleteLastFeature();// Delete placeholder point at end of line/polygon
          if (this.linePoints.length >= 2) await this.deleteLastFeature();// Delete line/polygon
          this.linePoints = [];
        }
        if (this.state.drawType === drawType) drawType = undefined;
      }
      this.setState(prevState => {
        return {
          ...prevState,
          drawType: drawType
        }
      }, () => {
        console.log('Set draw type to:', drawType);
        if (this.state.drawType === undefined || this.state.drawType === "point") this.linePoints = [];
      });
    }
    else console.log('Attempting to set the draw type to', drawType, 'but MapView Component not mounted.');
  };

  endDraw = async () => {
    if (this.state.drawType === 'line' || this.state.drawType === 'polygon') {
      await this.deleteLastFeature();// Delete placeholder point at end of line/polygon
      if (this.linePoints.length === 2 && this.state.drawType === 'polygon') await this.deleteLastFeature();// Delete line/polygon
    }
    this.linePoints = [];
    this.setDrawType(undefined);
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

    const centerCoordinate = [this.state.region.longitude, this.state.region.latitude];

    const mapProps = {
      basemap: this.state.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onSourcePress: this.onSourceLayerPress,
      shape: this.state.featureCollection,
      ref: ref => this.map = ref
    };

    return (
      <React.Fragment>
        {this.state.currentBasemap.id === 'mapboxSatellite' ? <MapboxSatelliteBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'mapboxOutdoors' ? <MapboxOutdoorsBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'osm' ? <OSMBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'macrostrat' ? <MacrostratBasemap {...mapProps}/> : null}
        {/*        <View style={styles.container}>
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
            {!this.state.currentBasemap.url ? null :
              <UrlTile
                urlTemplate={this.state.currentBasemap.url}
                maximumZ={this.state.currentBasemap.maxZoom}
              />}
          </MapView>
        </View>*/}
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
