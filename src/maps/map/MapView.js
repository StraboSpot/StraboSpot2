import React, {Component} from 'react';
import {Alert, AsyncStorage, StyleSheet} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import * as turf from '@turf/turf'
import {LATITUDE, LONGITUDE, LATITUDE_DELTA, LONGITUDE_DELTA, MapModes} from './Map.constants';
import {getMapTiles} from "../offline-maps/OfflineMapUtility";

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
    this._map = {};

    this.onMapPress = this.onMapPress.bind(this);
    this.onMapLongPress = this.onMapLongPress.bind(this);
    //this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  async componentDidMount() {
    this._isMounted = true;
    let featureCollection = MapboxGL.geoUtils.makeFeatureCollection();
    const featureIds = await AsyncStorage.getAllKeys(keys => {
      return keys
    });
    await AsyncStorage.multiGet(featureIds, (err, keys) => {
      console.log(keys);
      return keys.map((store) => {
        // featureCollection = store[1];
        // MapboxGL.geoUtils.addToFeatureCollection(featureCollection, store[1])
        try {
          console.log(store[1])
          console.log(JSON.parse(store[1]))
          MapboxGL.geoUtils.addToFeatureCollection(featureCollection, JSON.parse(store[1]))
        } catch (e) {
          console.log('Errored on', store[1])
        }
      })
    });
    console.log('feature', featureCollection);
    console.log('Setting initial basemap ...');
    this.setState(prevState => {
      return {
        ...prevState,
        currentBasemap: this.basemaps.mapboxOutdoors,
        featureCollection: featureCollection
      }
    }, () => {
      console.log('Finished setting initial basemap to:', this.state.currentBasemap);
      console.log('Finished loading spots:', this.state.featureCollection);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  saveMap = async () => {
    const visibleBounds = await this._map.getVisibleBounds();      // Mapbox
    // console.log('first bounds', visibleBounds);                 // COMMENT OUT LOGS BEFORE RELEASE HERE
    getMapTiles(visibleBounds).then(() => {
      console.log("Finished getting map tiles!");
      Alert.alert("Finished getting map tiles!")
    });
  };


  // Mapbox: Handle map press
  async onMapPress(e) {
    console.log('Map press detected:', e);
    if (!this.state.isEditFeature) {
      if (this.props.mapMode === MapModes.DRAW.POINT) {     // ToDo Not actually being used bc point set to current location
        console.log('Creating point ...');
        let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
        this.createFeature(feature);
      }
      else if (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON) {
        console.log('Creating', this.props.mapMode, '...');
        this.linePoints.push(e.geometry.coordinates);
        console.log(this.linePoints);
        if (this.linePoints.length === 1) {
          let feature = MapboxGL.geoUtils.makeFeature(e.geometry);
          this.createFeature(feature);
        }
        else if (this.linePoints.length === 2) {
          await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
          let feature = turf.lineString(this.linePoints);
          console.log('feature', feature);
          this.createFeature(feature);
          feature = MapboxGL.geoUtils.makeFeature(e.geometry);
          this.createFeature(feature);
        }
        else if (this.linePoints.length > 2 && this.props.mapMode === MapModes.DRAW.LINE) {
          await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
          await this.deleteLastFeature();     // Delete line/polygon
          let feature = turf.lineString(this.linePoints);
          console.log('feature', feature);
          this.createFeature(feature);
          feature = MapboxGL.geoUtils.makeFeature(e.geometry);
          this.createFeature(feature);
        }
        else if (this.linePoints.length > 2 && this.props.mapMode === MapModes.DRAW.POLYGON) {
          console.log('Creating polygon ...');
          await this.deleteLastFeature();     // Delete placeholder point at end of line/polygon
          await this.deleteLastFeature();     // Delete line/polygon
          let feature = turf.polygon([[...this.linePoints, this.linePoints[0]]]);
          console.log('feature', feature);
          this.createFeature(feature);
          feature = MapboxGL.geoUtils.makeFeature(e.geometry);
          this.createFeature(feature);
        }
      }
      else {
        const {screenPointX, screenPointY} = e.properties;
        const featureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
        if (featureSelected) {
          console.log('Feature selected:', featureSelected);
          let featureCollectionSelected = MapboxGL.geoUtils.makeFeatureCollection();
          MapboxGL.geoUtils.addToFeatureCollection(featureCollectionSelected, featureSelected);
          this.setState(prevState => {
            return {
              ...prevState,
              featureCollectionSelected: featureCollectionSelected
            }
          })
        }
        else console.log('No feature selected. No draw type set. No feature created.');
      }
    }
    else this.editFeatureCoordinates(e.geometry);
  }

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
    return this.state.featureCollectionSelected.features[0];
  };

  // Create a new feature in the feature collection
  createFeature = async feature => {
    if (this._isMounted) {
      feature.properties.id = '' + Date.now();        // ToDo: Generate unique string id here
      feature.properties.name = feature.properties.id;
      console.log('Creating new feature:', feature);
      this.setState(prevState => {
          return {
            ...prevState,
            featureCollection: MapboxGL.geoUtils.addToFeatureCollection(prevState.featureCollection, feature)
          }
        }, async () => {
          console.log('Finished creating new feature. Features: ', this.state.featureCollection);
          this.saveSpot(feature);
        }
      );
    }
    else console.log('Attempting to create a new feature but Map View Component not mounted.');
  };

  saveSpot = async (feature) => {
    console.log(feature);
    await AsyncStorage.setItem(feature.properties.id, JSON.stringify(feature), () => {
      console.log('saved item to storage')
    })
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
        console.log('Finished deleting last feature. Features:', this.state.featureCollection);
      });
    }
    else console.log('Attempting to delete the last feature but Map View Component not mounted.');
  };

  // Handle pressing on a feature
  /*onSourceLayerPress = (e) => {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
  };*/

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

  endDraw = async () => {
    if (this.linePoints.length > 0 &&
      (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON)) {
      this.deleteLastFeature();       // Delete placeholder point at end of line/polygon
    }
    this.linePoints = [];
    console.log('Draw ended.');
  };

  cancelDraw = async () => {
    if (this.props.mapMode === MapModes.DRAW.LINE || this.props.mapMode === MapModes.DRAW.POLYGON) {
      if (this.linePoints.length >= 1) await this.deleteLastFeature();// Delete placeholder point at end of line/polygon
      if (this.linePoints.length >= 2) await this.deleteLastFeature();// Delete line/polygon
    }
    this.linePoints = [];
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
      basemap: this.state.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onMapLongPress: this.onMapLongPress,
      //onSourcePress: this.onSourceLayerPress,
      features: this.state.featureCollection,
      selectedFeatures: this.state.featureCollectionSelected
    };

    return (
      <React.Fragment>
        {this.state.currentBasemap.id === 'mapboxSatellite' ? <MapboxSatelliteBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'mapboxOutdoors' ? <MapboxOutdoorsBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'osm' ? <OSMBasemap {...mapProps}/> : null}
        {this.state.currentBasemap.id === 'macrostrat' ? <MacrostratBasemap {...mapProps}/> : null}
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

export default mapView;
