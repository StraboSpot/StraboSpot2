import React, {Component} from 'react';
import {Alert, AsyncStorage, StyleSheet} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import * as turf from '@turf/turf'
import {LATITUDE, LONGITUDE, LATITUDE_DELTA, LONGITUDE_DELTA, MapModes} from './Map.constants';
import {connect} from 'react-redux';
import {FEATURE_SELECTED, FEATURE_ADD, FEATURE_DELETE, CURRENT_BASEMAP} from '../../store/Constants';

MapboxGL.setAccessToken(MAPBOX_KEY);

class mapView extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      currentBasemap: {},
      location: false,
      drawFeatures: [],
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
      featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
      isEditFeature: false,
      editFeature: {},
      editFeatureCoord: {}
    };

    this.basemaps = {
      osm: {
        id: 'osm',
        layerId: 'osmLayer',
        layerLabel: 'OSM Streets',
        layerSaveId: 'osm',
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 16
      },
      macrostrat: {
        id: 'macrostrat',
        layerId: 'macrostratLayer',
        layerLabel: 'Geology from Macrostrat',
        layerSaveId: 'macrostrat',
        url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
        maxZoom: 19
      },
      mapboxOutdoors: {
        id: 'mapboxOutdoors',
        layerId: 'mapboxOutdoorsLayer',
        layerLabel: 'Mapbox Topo',
        layerSaveId: 'mapbox.outdoors',
        url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      },
      mapboxSatellite: {
        id: 'mapboxSatellite',
        layerId: 'mapboxSatelliteLayer',
        layerLabel: 'Mapbox Satellite',
        layerSaveId: 'mapbox.satellite',
        url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
        maxZoom: 19
      }
    };

    this._map = {};

    this.onMapPress = this.onMapPress.bind(this);
    this.onMapLongPress = this.onMapLongPress.bind(this);
    //this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  async componentDidMount() {
    this.props.onRef(this);
    this._isMounted = true;
    let featureCollection = MapboxGL.geoUtils.makeFeatureCollection();
    // const featureIds = await AsyncStorage.getAllKeys(keys => {
    //   return keys
    // });
    // await AsyncStorage.multiRemove(featureIds);
    //
    //   await AsyncStorage.multiGet(featureIds, (err, keys) => {
    //   return keys.map((store) => {
    //     // featureCollection = store[1];
    //     // MapboxGL.geoUtils.addToFeatureCollection(featureCollection, store[1])
    //     try {
    //       // console.log(store[1])
    //       // console.log(JSON.parse(store[1]))
    //       MapboxGL.geoUtils.addToFeatureCollection(featureCollection, JSON.parse(store[1]))
    //     } catch (e) {
    //       console.log('Errored on', store[1])
    //     }
    //   })
    // });
    console.log('feature', featureCollection);
    console.log('Setting initial basemap ...', this.basemaps.mapboxOutdoors);
    this.props.onCurrentBasemap(this.basemaps.mapboxOutdoors);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Mapbox: Handle map press
  async onMapPress(e) {
    console.log('Map press detected:', e);
    if (!this.state.isEditFeature) {
      // Draw a feature
      if (this.props.mapMode === MapModes.DRAW.POINT || this.props.mapMode === MapModes.DRAW.LINE
        || this.props.mapMode === MapModes.DRAW.POLYGON) {
        console.log('Drawing', this.props.mapMode, '...');
        let feature = {};
        const newCoord = turf.getCoord(e);
        // Draw a line given a point and a new point
        if (this.state.drawFeatures.length === 1) {
          const pointCoord = turf.getCoord(this.state.drawFeatures[0]);
          let feature = turf.lineString([pointCoord, newCoord]);
          this.drawFeature(feature);
        }
        // Draw a line given a line and a new point
        else if (this.state.drawFeatures.length > 1 && this.props.mapMode === MapModes.DRAW.LINE) {
          const lineCoords = turf.getCoords(this.state.drawFeatures[1]);
          let feature = turf.lineString([...lineCoords, newCoord]);
          this.drawFeature(feature);
        }
        else if (this.state.drawFeatures.length > 1 && this.props.mapMode === MapModes.DRAW.POLYGON) {
          const firstCoord = turf.getCoord(this.state.drawFeatures[0]);
          // Draw a polygon given a line and a new point
          if (turf.getType(this.state.drawFeatures[1]) === 'LineString') {
            const lineCoords = turf.getCoords(this.state.drawFeatures[1]);
            feature = turf.polygon([[...lineCoords, newCoord, firstCoord]]);
          }
          // Draw a polygon given a polygon and a new point
          else {
            let polyCoords = turf.getCoords(this.state.drawFeatures[1])[0];
            polyCoords.pop();
            feature = turf.polygon([[...polyCoords, newCoord, firstCoord]]);
          }
          this.drawFeature(feature);
        }
        // Draw a point for the last coordinate touched
        feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.drawFeature(feature);
      }
      // Select a feature
      else {
        console.log('Selecting feature');
        const {screenPointX, screenPointY} = e.properties;
        const featureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
        if (featureSelected) {
          console.log('Feature selected:', featureSelected);
          let featureCollectionSelected = MapboxGL.geoUtils.makeFeatureCollection();
          MapboxGL.geoUtils.addToFeatureCollection(featureCollectionSelected, featureSelected);
          this.props.onFeaturesSelected(featureCollectionSelected)
          // console.log('FEATURECOLLECTIONSEL',featureCollectionSelected)
          // this.setState(prevState => {
          //   return {
          //     ...prevState,
          //     featureCollectionSelected: featureCollectionSelected
          //   }
          // })
        }
        else console.log('No feature selected. No draw type set. No feature created.');
      }
    }
    // Edit a feature
    else this.editFeatureCoordinates(e.geometry);
  }

  clearDrawFeature = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          drawFeatures: []
        }
      }, () => {
        console.log('Draw features cleared:', this.state.drawFeatures);
      });
    }
    else console.log('Attempting to clear the draw feature but Map View Component not mounted.');
  };

  drawFeature = (feature) => {
    if (this._isMounted) {
      this.setState(prevState => {
        // Remove the feature itself and the last coordinate
        if (prevState.drawFeatures.length > 2) {
          prevState.drawFeatures.pop();
          prevState.drawFeatures.pop();
        }
        return {
          ...prevState,
          drawFeatures: prevState.drawFeatures.concat(feature)
        }
      }, () => {
        console.log('New draw feature added:', this.state.drawFeatures);
      });
    }
    else console.log('Attempting to draw feature but Map View Component not mounted.');
  };

  // Edit the coordinates of a selected feature
  editFeatureCoordinates = (newGeometry) => {
    if (this._isMounted) {
      let featuresNotEditing = this.state.featureCollection.features.filter(
        feature => feature.properties.id !== this.state.editFeature.properties.id);
      let editedFeatureCollection = MapboxGL.geoUtils.makeFeatureCollection();
      editedFeatureCollection.features = featuresNotEditing;
      this.setState(prevState => {
        if (turf.getType(prevState.editFeature) === 'Point') prevState.editFeature.geometry = newGeometry;
        else if (turf.getType(prevState.editFeature) === 'LineString') {
          const coords = turf.getCoords(prevState.editFeature);
          console.log(coords, prevState.editFeatureCoord);
          for (let i = 0; i < coords.length; i++) {
            if (coords[i][0] === prevState.editFeatureCoord[0] && coords[i][1] === prevState.editFeatureCoord[1]) {
              prevState.editFeature.geometry.coordinates[i] = turf.getCoord(newGeometry);
            }
          }
        }
        else if (turf.getType(prevState.editFeature) === 'Polygon') {
          const coords = turf.getCoords(prevState.editFeature);
          console.log(coords, prevState.editFeatureCoord);
          for (let i = 0; i < coords.length; i++) {
            for (let j = 0; j < coords[i].length; j++) {
              if (coords[i][j][0] === prevState.editFeatureCoord[0] && coords[i][j][1] === prevState.editFeatureCoord[1]) {
                prevState.editFeature.geometry.coordinates[i][j] = turf.getCoord(newGeometry);
              }
            }
          }
        }
        console.log('Edited Feature:', prevState.editFeature);
        return {
          ...prevState,
          featureCollection: MapboxGL.geoUtils.addToFeatureCollection(editedFeatureCollection, prevState.editFeature),
          featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
          isEditFeature: false,
          editFeature: {},
          editFeatureCoord: {}
        }
      }, () => {
        this.props.toggleCancelEditButton();
        console.log('Finished editing feature. Features: ', this.state.featureCollection);
      });
    }
    else console.log('Attempting to edit feature coordinates but Map View Component not mounted.');
  };

  getSelectedFeature = () => {
    console.log(this.state.featureCollectionSelected);
    return this.props.feature
    // return this.state.featureCollectionSelected.features[0];
  };

  getCurrentBasemap = () => {
    return this.state.currentBasemap;
  };

  getExtentString = async () => {
    const mapBounds = await this._map.getVisibleBounds();

    let right = mapBounds[0][0];
    let top = mapBounds[0][1];
    let left = mapBounds[1][0];
    let bottom = mapBounds[1][1];
    let extentString = left + ',' + bottom + ',' + right + ',' + top;

    return extentString;
  };

  getCurrentZoom = async () => {
    const currentZoom = await this._map.getZoom();
    return currentZoom;
  };

  getTileCount = async (zoomLevel) => {
    var tileCount = null;
    var extentString = await this.getExtentString();
    try {
      //Assign the promise unresolved first then get the data using the json method.
      console.log("sending this extent to server: ", extentString);
      console.log("sending zoom to server: ", zoomLevel);
      const tileCountApiCall = await fetch('http://tiles.strabospot.org/zipcount?extent=' + extentString + '&zoom=' + zoomLevel);
      const tileCount = await tileCountApiCall.json();
      console.log("got count from server: ", tileCount);
      return tileCount.count;
    } catch (err) {
      console.log("Error fetching data from tile count service.", err);
    }
  };

  // Create a new feature in the feature collection
  createFeature = async feature => {
    if (this._isMounted) {
      feature.properties.id = '' + Date.now();        // ToDo: Generate unique string id here
      feature.properties.name = feature.properties.id;
      console.log('Creating new feature:', feature);
      await this.props.onFeatureAdd(feature);
      console.log('Finished creating new feature. Features: ', this.props.featureCollection);
    }
    else console.log('Attempting to create a new feature but Map View Component not mounted.');
  };

  // saveSpot = async (feature) => {
  // console.log(feature);
  //   await AsyncStorage.setItem(feature.properties.id, JSON.stringify(feature), () => {
  //     console.log('saved item to storage')
  //   })
  // };

  // Handle pressing on a feature
  /*onSourceLayerPress = (e) => {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
  };*/

  changeMap = (mapName) => {
    if (this._isMounted) {
      if (mapName === 'mapboxSatellite' || mapName === 'mapboxOutdoors' || mapName === 'osm' || mapName === 'macrostrat') {
        console.log('Switching basemap to:', mapName);
        this.props.onCurrentBasemap(this.basemaps[mapName])
      }
      else console.log('Cancel switching basemaps. Basemap', mapName, 'still needs to be setup.');
    }
    else console.log('Attempting to switch basemap to', mapName, 'but MapView Component not mounted.');
  };

  // Create a point feature at the current location
  setPointAtCurrentLocation = async () => {
    try {
      await this.setCurrentLocation();
      let feature = MapboxGL.geoUtils.makePoint([this.state.longitude, this.state.latitude]);
      this.createFeature(feature);
    } catch (error) {
      console.log(error);
    }
  };

  // Get the current location then fly the map to that location
  goToCurrentLocation = async () => {
    try {
      await this.setCurrentLocation();
      console.log('flying');
      this._map.flyTo([this.state.longitude, this.state.latitude]);
    } catch (error) {
      console.log(error);
    }
  };

  // Get the current location from the device and set it in the State
  setCurrentLocation = async () => {
    const geolocationOptions = {timeout: 5000, maximumAge: 0, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this._isMounted) {
            this.setState(prevState => {
              return {
                ...prevState,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }, () => {
              console.log('Got Current Location:', this.state.latitude, ',', this.state.longitude);
              resolve();
            });
          }
          else reject('Attempting to set the current location but MapView Component not mounted.');
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions
      );
    });
  };

  endDraw = () => {
    this.createFeature(this.state.drawFeatures.splice(1, 1)[0]);
    this.clearDrawFeature();
    console.log('Draw ended.');
  };

  cancelDraw =  () => {
    this.clearDrawFeature();
    console.log('Draw canceled.');
  };

  cancelEdit = () => {
    if (this._isMounted) {
      this.setState(prevState => {
        return {
          ...prevState,
          featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
          isEditFeature: false,
          editFeature: {},
          editFeatureCoord: {}
        }
      }, () => {
        console.log('Edit canceled.');
      });
    }
    else console.log('Attempting to cancel editing but MapView Component not mounted.');
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const featureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
    if (featureSelected) {
      this.props.toggleCancelEditButton();
      const coordinatePressed = await this._map.getCoordinateFromView([screenPointX, screenPointY]);
      const explodedFeatureCollection = turf.explode(featureSelected);
      const nearestPointSelected = turf.nearestPoint(coordinatePressed, explodedFeatureCollection);
      let featureCollectionSelected = MapboxGL.geoUtils.makeFeatureCollection();
      MapboxGL.geoUtils.addToFeatureCollection(featureCollectionSelected, featureSelected);
      if (turf.getType(featureSelected) === 'LineString' || turf.getType(featureSelected) === 'Polygon') {
        MapboxGL.geoUtils.addToFeatureCollection(featureCollectionSelected, nearestPointSelected);
      }
      if (this._isMounted) {
        this.setState(prevState => {
          return {
            ...prevState,
            featureCollectionSelected: featureCollectionSelected,
            isEditFeature: true,
            editFeature: featureSelected,
            editFeatureCoord: turf.getCoord(nearestPointSelected),
          }
        }, () => {
          console.log('Set selected feature collection:', this.state.featureCollectionSelected);
        });
      }
      else console.log('Attempting to set the selected feature but MapView Component not mounted.');
    }
    else console.log('No feature at selected coordinate.');
  };

  // Selects features within the bounding box and returns the first on if there are more then one
  getFeatureAtPress = async (screenPointX, screenPointY) => {
    const r = 10; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await this._map.queryRenderedFeaturesInRect(
      bbox, null, ['pointLayer', 'lineLayer', 'polygonLayer']);
    console.log('Feature collection where pressed:', featureCollectionInRect);
    let featureSelected = undefined;
    if (featureCollectionInRect.features.length > 0) {
      featureSelected = featureCollectionInRect.features[0]; // Just use first feature, if more than one
    }
    console.log('Feature pressed:', featureSelected);
    return featureSelected;
  };

  render() {
    const centerCoordinate = [this.state.longitude, this.state.latitude];
    const mapProps = {
      ref: ref => this._map = ref,
      basemap: this.props.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onMapLongPress: this.onMapLongPress,
      //onSourcePress: this.onSourceLayerPress,
      features: this.props.featureCollection,
      selectedFeatures: this.props.featureCollectionSelected,
      drawFeatures: turf.featureCollection(this.state.drawFeatures)
    };

    return (
      <React.Fragment>
        {this.props.currentBasemap.id === 'mapboxSatellite' ? <MapboxSatelliteBasemap {...mapProps}/> : null}
        {this.props.currentBasemap.id === 'mapboxOutdoors' ? <MapboxOutdoorsBasemap {...mapProps}/> : null}
        {this.props.currentBasemap.id === 'osm' ? <OSMBasemap {...mapProps}/> : null}
        {this.props.currentBasemap.id === 'macrostrat' ? <MacrostratBasemap {...mapProps}/> : null}
      </React.Fragment>
    );
  }
}

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

const mapStateToProps = (state) => {
  return {
    // selectedSpot: state.home.selectedSpot,
    featureCollectionSelected: state.home.featureCollectionSelected,
    featureCollection: state.home.featureCollection,
    currentBasemap: state.map.currentBasemap,
    map: state.map.map
  }
};

const mapDispatchToProps = {
  onFeaturesSelected: (featureCollectionSelected) => ({type: FEATURE_SELECTED, feature: featureCollectionSelected}),
  onFeatureAdd: (feature) => ({type: FEATURE_ADD, feature: feature}),
  onFeatureDelete: (id) => ({type: FEATURE_DELETE, id: id}),
  onCurrentBasemap: (basemap) => ({type: CURRENT_BASEMAP, basemap: basemap })
};

export default connect(mapStateToProps, mapDispatchToProps)(mapView);
