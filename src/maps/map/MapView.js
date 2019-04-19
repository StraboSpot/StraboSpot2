import React, {Component} from 'react';
import {Alert, AsyncStorage, StyleSheet} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import * as turf from '@turf/turf'
import {LATITUDE, LONGITUDE, LATITUDE_DELTA, LONGITUDE_DELTA, MapModes} from './Map.constants';
import {connect} from 'react-redux';
import {
  CURRENT_BASEMAP,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  FEATURES_SELECTED_CLEARED,
  FEATURES_UPDATED
} from '../../store/Constants';

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
      isEditingFeature: false,
      featuresNotEditing: [],
      vertexToEdit: {}
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
  }

  async componentDidMount() {
    this.props.onRef(this);
    this._isMounted = true;
    console.log('Setting initial basemap ...', this.basemaps.mapboxOutdoors);
    this.props.onCurrentBasemap(this.basemaps.mapboxOutdoors);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.props.onRef(undefined)
  }

  // Mapbox: Handle map press
  async onMapPress(e) {
    console.log('Map press detected:', e);
    if (!this.state.isEditingFeature) {
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
      // Select/Unselect a feature
      else {
        const {screenPointX, screenPointY} = e.properties;
        const featureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
        if (Object.getOwnPropertyNames(featureSelected).length > 0) this.props.onFeatureSelected(featureSelected);
        else this.props.onFeaturesSelectedCleared();
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
    if (this.props.featuresSelected.length > 0) {
      console.log('Editing Coordinate');
      let featureEditing = this.props.featuresSelected[0];
      console.log('Feature Editing:', featureEditing);
      const coords = turf.getCoords(featureEditing);
      const coordToEdit = turf.getCoords(this.state.vertexToEdit);
      const newCoord = turf.getCoord(newGeometry);
      console.log('Original coords:', coords, 'Coord to edit:', coordToEdit, 'New coord:', newCoord);
      if (turf.getType(featureEditing) === 'Point') featureEditing.geometry = newGeometry;
      else if (turf.getType(featureEditing) === 'LineString') {
        for (let i = 0; i < coords.length; i++) {
          if (coords[i][0] === coordToEdit[0] && coords[i][1] === coordToEdit[1]) {
            featureEditing.geometry.coordinates[i] = turf.getCoord(newGeometry);
          }
        }
      }
      else if (turf.getType(featureEditing) === 'Polygon') {
        for (let i = 0; i < coords.length; i++) {
          for (let j = 0; j < coords[i].length; j++) {
            if (coords[i][j][0] === coordToEdit[0] && coords[i][j][1] === coordToEdit[1]) {
              featureEditing.geometry.coordinates[i][j] = turf.getCoord(newGeometry);
            }
          }
        }
      }
      console.log('Edited coords:', turf.getCoords(featureEditing));
      this.props.onFeaturesSelectedCleared();
      if (this._isMounted) {
        this.setState(prevState => {
          return {
            ...prevState,
            drawFeatures: [],
            featuresNotEditing: [...prevState.featuresNotEditing, featureEditing],
            vertexToEdit: {}
          }
        }, () => {
          console.log('Finished editing feature. Features: ', this.props.features);
        });
      }
      else console.log('Attempting to edit feature coordinates but Map View Component not mounted.');
    }
    else console.log('No feature selected');
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
      const tileCountApiCall = await fetch(
        'http://tiles.strabospot.org/zipcount?extent=' + extentString + '&zoom=' + zoomLevel);
      const tileCount = await tileCountApiCall.json();
      console.log("got count from server: ", tileCount);
      return tileCount.count;
    } catch (err) {
      console.log("Error fetching data from tile count service.", err);
    }
  };

  // Create a new feature in the feature collection
  createFeature = async (feature) => {
    if (this._isMounted) {
      feature.properties.id = '' + Date.now();        // ToDo: Generate unique string id here
      feature.properties.name = feature.properties.id;
      console.log('Creating new feature:', feature);
      await this.props.onFeatureAdd(feature);
      console.log('Finished creating new feature. Features: ', this.props.features);
    }
    else console.log('Attempting to create a new feature but Map View Component not mounted.');
  };

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
      Alert.alert("Geolocation Error", "Error getting current location.");
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

  cancelDraw = () => {
    this.clearDrawFeature();
    console.log('Draw canceled.');
  };

  cancelEdits = () => {
    if (this._isMounted) {
      this.props.onFeaturesSelectedCleared();
      this.setState(prevState => {
        return {
          ...prevState,
          isEditingFeature: false,
          drawFeatures: [],
          featuresNotEditing: [],
          vertexToEdit: {}
        }
      }, () => {
        console.log('Edit canceled. State updated:', this.state);
      });
    }
    else console.log('Attempting to cancel editing but MapView Component not mounted.');
  };

  saveEdits = () => {
    this.props.onFeaturesUpdated(this.state.featuresNotEditing);
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const editFeatureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
    if (Object.getOwnPropertyNames(editFeatureSelected).length > 0) {
      this.props.startEdit();
      const coordinatePressed = await this._map.getCoordinateFromView([screenPointX, screenPointY]);
      let explodedFeatureCollection = turf.explode(editFeatureSelected);
      const nearestPoint = turf.nearestPoint(coordinatePressed, explodedFeatureCollection);
      delete nearestPoint.properties.distanceToPoint;
      delete nearestPoint.properties.featureIndex;
      this.props.onFeatureSelected(editFeatureSelected);
      if (turf.getType(editFeatureSelected) === 'Point') explodedFeatureCollection = turf.featureCollection([]);
      const featuresNotEditing = this.state.featuresNotEditing.length === 0 ? this.props.features.filter(
        feature => feature.properties.id !== this.props.featuresSelected[0].properties.id) : this.state.featuresNotEditing.filter(
        feature => feature.properties.id !== this.props.featuresSelected[0].properties.id);
      if (this._isMounted) {
        this.setState(prevState => {
          return {
            ...prevState,
            drawFeatures: explodedFeatureCollection.features,
            isEditingFeature: true,
            vertexToEdit: nearestPoint,
            featuresNotEditing: featuresNotEditing
          }
        }, () => {
          console.log('Set feature to edit:', editFeatureSelected);
          console.log('Set feature vertex to edit:', nearestPoint)
        });
      }
      else console.log('Attempting to set the selected feature but MapView Component not mounted.');
    }
    else console.log('No feature at selected coordinate.');
  };

  // Selects features within the bounding box and returns the first on if there are more then one
  getFeatureAtPress = async (screenPointX, screenPointY) => {
    const r = 20; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await this._map.queryRenderedFeaturesInRect(
      bbox, null, ['pointLayer', 'lineLayer', 'polygonLayer']);
    let featureSelected = {};
    if (featureCollectionInRect.features.length > 0) {
      if (featureCollectionInRect.features.length > 1) {
        console.log('Multiple features where pressed:', featureCollectionInRect);
      }
      featureSelected = featureCollectionInRect.features[0]; // Just use first feature, if more than one
      delete featureSelected.id;          // Extra empty id field created from queryRenderedFeaturesInRect so delete it
      console.log('Feature selected:', featureSelected);
    }
    else console.log('No feature selected.');
    return featureSelected;
  };

  render() {
    const centerCoordinate = [this.state.longitude, this.state.latitude];

    // If in Edit mode only display the features that aren't currently being edited in the main feature layer
    // The feature currently being edited will be displayed in the selected features layer
    const displayFeatures = this.props.mapMode === MapModes.EDIT ? this.state.featuresNotEditing : this.props.features;

    const mapProps = {
      ref: ref => this._map = ref,
      basemap: this.props.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onMapLongPress: this.onMapLongPress,
      features: turf.featureCollection(displayFeatures),
      selectedFeatures: turf.featureCollection(this.props.featuresSelected),
      drawFeatures: turf.featureCollection(this.state.drawFeatures),
      //editFeatureVertex: turf.featureCollection([this.state.vertexToEdit])  // ToDo Why doesn't this work?
      editFeatureVertex: Object.getOwnPropertyNames(this.state.vertexToEdit).length > 0 ?
        turf.featureCollection([this.state.vertexToEdit]) : MapboxGL.geoUtils.makeFeatureCollection()
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
    selectedSpot: state.home.selectedSpot,
    features: state.home.features,
    featuresSelected: state.home.featuresSelected,
    currentBasemap: state.map.currentBasemap,
    map: state.map.map
  }
};

const mapDispatchToProps = {
  onFeaturesSelectedCleared: () => ({type: FEATURES_SELECTED_CLEARED}),
  onFeatureSelected: (featureSelected) => ({type: FEATURE_SELECTED, feature: featureSelected}),
  onFeatureAdd: (feature) => ({type: FEATURE_ADD, feature: feature}),
  onFeatureDelete: (id) => ({type: FEATURE_DELETE, id: id}),
  onFeaturesUpdated: (features) => ({type: FEATURES_UPDATED, features: features}),
  onCurrentBasemap: (basemap) => ({type: CURRENT_BASEMAP, basemap: basemap})
};

export default connect(mapStateToProps, mapDispatchToProps)(mapView);
