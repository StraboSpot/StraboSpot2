import React, {Component} from 'react';
import {Alert, AsyncStorage, StyleSheet} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {MAPBOX_KEY} from '../../MapboxConfig'
import {CustomBasemap, MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from "./Basemaps";
import * as turf from '@turf/turf/index'
import {LATITUDE, LONGITUDE, LATITUDE_DELTA, LONGITUDE_DELTA, MapModes} from './Map.constants';
import {connect} from 'react-redux';
import {getNewId} from "../../shared/Helpers";
import {mapReducers} from "./Map.constants";
import {spotReducers} from "../../spots/Spot.constants";
import {
  // CURRENT_BASEMAP,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  FEATURES_SELECTED_CLEARED,
  FEATURES_UPDATED
} from '../../store/Constants';
import {truncDecimal} from "../../shared/Helpers";

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
      featuresNotSelected: [],
      featuresSelected: [],
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
    console.log('Map mode:', this.props.mapMode);
    // Select/Unselect a feature
    if (this.props.mapMode === MapModes.VIEW) {
      const {screenPointX, screenPointY} = e.properties;
      const featureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
      if (Object.getOwnPropertyNames(featureSelected).length > 0) this.props.onFeatureSelected(featureSelected);
      else {
        this.props.onFeaturesSelectedCleared();
        this.props.showModal('isCompassModalVisible', false);
        this.props.showModal('isSamplesModalVisible', false);
      }
    }
    // Draw a feature
    else if (this.props.mapMode === MapModes.DRAW.POINT || this.props.mapMode === MapModes.DRAW.LINE
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
    // Edit a feature
    else if (this.props.mapMode === MapModes.EDIT) {
      // Select/Unselect new vertex to edit
      const {screenPointX, screenPointY} = e.properties;
      console.log('Select/Unselect vertex (and thus feature with the vertex) to edit');
      console.log('Selecting feature to edit...');

      // If we don't have a selected feature, check to see if point pressed was at a feature
      //   If not, do nothing
      //   If so, set that feature to the selected feature and set all other features as features-not-selected and
      //   explode the vertices of the selected feature if the feature is a line or polygon and add to draw layer
      // If we already have a selected feature check to see if we also already have a selected vertex
      // If not, and there is a different feature at the point pressed, set that feature as the selected feature
      // If not, and there is a vertex of the selected feature at the point pressed, set that as the selected vertex
      // If not, and there is no feature at the point pressed, unselect the selected feature
      // If so, check to see if point pressed was at another vertex of the selected feature
      //     If not edit vertex coords to those of pressed point
      //     If so switch selected vertex to vertex at pressed point
      const editFeatureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
      if (this.state.featuresSelected.length === 0) {
        //const editFeatureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
        if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) console.log('No feature selected.');
        else this.setSelectedFeatureToEdit(editFeatureSelected);
      }
      else {
        if (Object.getOwnPropertyNames(this.state.vertexToEdit).length === 0) {
          if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) this.clearSelectedFeatureToEdit();
          else {
            const vertexSelected = await this.getDrawFeatureAtPoint(screenPointX, screenPointY);
            if (Object.getOwnPropertyNames(vertexSelected).length === 0) {
              if (this.state.featuresSelected[0].properties.id === editFeatureSelected.properties.id) {
                this.clearSelectedFeatureToEdit();
              }
              else this.setSelectedFeatureToEdit(editFeatureSelected);
            }
            else this.setSelectedVertexToEdit(vertexSelected);
          }
        }
        else {
          const vertexSelected = await this.getDrawFeatureAtPoint(screenPointX, screenPointY);
          if (Object.getOwnPropertyNames(vertexSelected).length === 0) this.editFeatureCoordinates(e.geometry);
          else {
            if (this.state.vertexToEdit.properties.id === vertexSelected.properties.id) {
              this.clearSelectedVertexToEdit();
            }
            else this.setSelectedVertexToEdit(vertexSelected);
          }
        }
      }
    }
    else {
      console.log('Error. Unknown map mode:', this.props.mapMode);
    }
  }

  setSelectedFeatureToEdit = (feature) => {
    this.props.onFeatureSelected(feature);
    let featuresNotSelected = [];
    if (this.state.featuresNotSelected.length === 0 && this.state.featuresSelected.length === 0) {
      featuresNotSelected = this.props.features.filter(
        featureInFilter => featureInFilter.properties.id !== feature.properties.id);
    }
    else {
      featuresNotSelected = this.state.featuresNotSelected.filter(
        featureInFilter => featureInFilter.properties.id !== feature.properties.id);
    }
    let drawFeatures = turf.explode(feature).features;
    // If polygon remove last exploded point because it is the same as the first
    if (turf.getType(feature) === 'Polygon') drawFeatures.pop();
    this.setState(prevState => {
      return {
        ...prevState,
        drawFeatures: drawFeatures,
        featuresNotSelected: [...featuresNotSelected, ...prevState.featuresSelected],
        featuresSelected: [feature]
      }
    }, () => {
      console.log('Set feature to edit:', feature);
      if (turf.getType(feature) === 'Point') this.setSelectedVertexToEdit(feature);
    });
  };

  clearSelectedFeatureToEdit = () => {
    this.props.onFeaturesSelectedCleared();
    this.setState(prevState => {
      return {
        ...prevState,
        drawFeatures: [],
        featuresSelected: [],
        featuresNotSelected: [...prevState.featuresNotSelected, ...prevState.featuresSelected],
        vertexToEdit: {}                              // Not really needed here
      }
    }, () => {
      console.log('Cleared selected feature.');
    });
  };

  setSelectedVertexToEdit = (vertex) => {
    this.setState(prevState => {
      return {
        ...prevState,
        vertexToEdit: vertex
      }
    }, () => {
      console.log('Set vertex to edit:', vertex);
    });
  };

  clearSelectedVertexToEdit = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        vertexToEdit: {}
      }
    }, () => {
      console.log('Cleared selected vertex to edit.');
      if (turf.getType(this.state.featuresSelected[0]) === 'Point') this.clearSelectedFeatureToEdit();
    });
  };

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
    if (this.state.featuresSelected.length > 0) {
      console.log('Editing Coordinate');
      let featureEditing = this.state.featuresSelected[0];
      console.log('Feature Editing:', featureEditing);
      const coords = turf.getCoords(featureEditing);
      const coordToEdit = turf.getCoords(this.state.vertexToEdit);
      const newCoord = turf.getCoord(newGeometry);
      console.log('Original coords:', coords, 'Coord to edit:', coordToEdit, 'New coord:', newCoord);
      if (turf.getType(featureEditing) === 'Point') featureEditing.geometry = newGeometry;
      else if (turf.getType(featureEditing) === 'LineString') {
        for (let i = 0; i < coords.length; i++) {
          if (truncDecimal(coords[i][0]) === truncDecimal(coordToEdit[0])
            && truncDecimal(coords[i][1]) === truncDecimal(coordToEdit[1])) {
            featureEditing.geometry.coordinates[i] = turf.getCoord(newGeometry);
          }
        }
      }
      else if (turf.getType(featureEditing) === 'Polygon') {
        for (let i = 0; i < coords.length; i++) {
          for (let j = 0; j < coords[i].length; j++) {
            if (truncDecimal(coords[i][j][0]) === truncDecimal(coordToEdit[0])
              && truncDecimal(coords[i][j][1]) === truncDecimal(coordToEdit[1])) {
              featureEditing.geometry.coordinates[i][j] = turf.getCoord(newGeometry);
            }
          }
        }
      }
      console.log('Edited coords:', turf.getCoords(featureEditing));
      let drawFeatures = turf.explode(featureEditing).features;
      // If polygon remove last exploded point because it is the same as the first
      if (turf.getType(featureEditing) === 'Polygon') drawFeatures.pop();
      if (this._isMounted) {
        this.setState(prevState => {
          return {
            ...prevState,
            drawFeatures: drawFeatures,
            featuresSelected: [featureEditing],
            vertexToEdit: {}
          }
        }, () => {
          console.log('Finished editing feature. Selected Feature: ', this.state.featuresSelected);
          if (turf.getType(featureEditing) === 'Point') this.clearSelectedFeatureToEdit();
        });
      }
      else console.log('Attempting to edit feature coordinates but Map View Component not mounted.');
    }
    else console.log('No feature selected');
  };

  getCurrentBasemap = () => {
    return this.props.currentBasemap;
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
      feature.properties.id = getNewId();
      feature.properties.name = 'Spot ' + this.props.features.length;
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
          featuresNotSelected: [],
          featuresSelected: [],
          vertexToEdit: {}
        }
      }, () => {
        console.log('Edit canceled. State updated:', this.state);
      });
    }
    else console.log('Attempting to cancel editing but MapView Component not mounted.');
  };

  saveEdits = () => {
    this.props.onFeaturesUpdated([...this.state.featuresNotSelected, ...this.state.featuresSelected]);
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const editFeatureSelected = await this.getFeatureAtPress(screenPointX, screenPointY);
    if (this.props.mapMode === MapModes.VIEW) {
      this.props.startEdit();
      if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) {
        this.setState(prevState => {
          return {
            ...prevState,
            drawFeatures: [],
            featuresNotSelected: this.props.features,
            featuresSelected: []
          }
        }, async () => {
          console.log('No features set feature to edit.');
        });
      }
      else this.setSelectedFeatureToEdit(editFeatureSelected);
    }
    else if (this.props.mapMode === MapModes.EDIT) {
      if (this.state.featuresSelected.length > 0) {
        let featureSelected = this.state.featuresSelected[0];
        if (turf.getType(featureSelected) === 'LineString' || turf.getType(featureSelected) === 'Polygon') {
          const vertexSelected = await this.getDrawFeatureAtPoint(screenPointX, screenPointY);
          let vertexToEdit = {};
          let drawFeatures = this.state.drawFeatures;
          if (Object.getOwnPropertyNames(vertexSelected).length === 0) {
            // To add a vertex to a line the new point selected must be on the line
            if (turf.getType(featureSelected) === 'LineString' && Object.getOwnPropertyNames(
              editFeatureSelected).length !== 0 && featureSelected.properties.id === editFeatureSelected.properties.id) {
              [featureSelected, vertexToEdit] = this.addVertexToLine(featureSelected, e.geometry);
            }
            else if (turf.getType(featureSelected) === 'Polygon') {
              featureSelected = this.addVertexToPolygon(featureSelected, e.geometry);
            }
          }
          else {
            console.log('Deleting selected vertex...');
            const coords = turf.getCoords(featureSelected);
            const coordToEdit = turf.getCoord(vertexSelected);
            if (turf.getType(featureSelected) === 'LineString' && coords.length > 3) {
              for (let i = 0; i < coords.length; i++) {
                if (truncDecimal(coords[i][0]) === truncDecimal(coordToEdit[0])
                  && truncDecimal(coords[i][1]) === truncDecimal(coordToEdit[1])) {
                  featureSelected.geometry.coordinates.splice(i, 1);
                }
              }
            }
            else if (turf.getType(featureSelected) === 'Polygon' && coords[0].length > 4) {
              for (let i = 0; i < coords.length; i++) {
                for (let j = 0; j < coords[i].length; j++) {
                  if (truncDecimal(coords[i][j][0]) === truncDecimal(coordToEdit[0])
                    && truncDecimal(coords[i][j][1]) === truncDecimal(coordToEdit[1])) {
                    featureSelected.geometry.coordinates[i].splice(j, 1);
                  }
                }
              }
            }
            else console.log('Not enough vertices in selected feature to delete one.');
          }
          this.setState(prevState => {
            return {
              ...prevState,
              drawFeatures: turf.explode(featureSelected).features,
              featuresSelected: [featureSelected],
              vertexToEdit: vertexToEdit
            }
          }, () => {
            console.log('Set selected feature:', featureSelected);
          });
        }
        else console.log('Selected feature is not a line or polygon. No action taken.');
      }
      else console.log('No feature selected. No action taken.');
    }
    else console.log('Not in View or Edit modes. No action taken.');
  };

  // Get the feature at a point from the draw layer
  getDrawFeatureAtPoint = async (screenPointX, screenPoint) => {
    return await this.getFeatureAtPress(screenPointX, screenPoint, ['pointLayerDraw']);
  };

  // Get the feature within a bounding box from a given layer, returning only the first one if there is more than one
  // If no layer is provided use the main feature layers and the selected layers
  getFeatureAtPress = async (screenPointX, screenPointY, layers) => {
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    if (!layers) layers = ['pointLayer', 'lineLayer', 'polygonLayer', 'pointLayerSelected', 'lineLayerSelected', 'polygonLayerSelected'];
    const featureCollectionInRect = await this._map.queryRenderedFeaturesInRect(bbox, null, layers);
    const featuresInRect = featureCollectionInRect.features;
    let featureSelected = {};
    if (featuresInRect.length > 0) {
      if (featuresInRect.length > 1) console.log('Multiple features where pressed:', featuresInRect);
      featureSelected = featuresInRect[0]; // Just use first feature, if more than one
      delete featureSelected.id;          // Extra empty id field created from queryRenderedFeaturesInRect so delete it
      console.log('Feature selected:', featureSelected);
    }
    else console.log('No feature selected.');
    return featureSelected;
  };

  // Add a new vertex to a polygon by creating a new feature for each possible place to insert the
  // new vertex into the feature polygon coordiantes then taking the union of those features
  addVertexToPolygon = (polygon, newVertexGeom) => {
    console.log('Adding vertex to selected polygon feature...');
    let possiblePolys = [];
    for (let j = 1; j < polygon.geometry.coordinates[0].length; j++) {
      let cloned = JSON.parse(JSON.stringify(polygon));
      cloned.geometry.coordinates[0].splice(j, 0, newVertexGeom.coordinates);
      possiblePolys.push(cloned);
    }
    const possiblePolysFC = turf.featureCollection(possiblePolys);
    const unkinkedPolys = turf.unkinkPolygon(possiblePolysFC).features;
    return turf.union(...unkinkedPolys);
  };

  // Add a new vertex to a line
  addVertexToLine = (line, newVertexGeom) => {
    console.log('Adding vertex to selected line feature...');
    const newPointOnLine = turf.nearestPointOnLine(line, newVertexGeom);
    const i = newPointOnLine.properties.index;
    line.geometry.coordinates.splice(i + 1, 0, newPointOnLine.geometry.coordinates);
    return [line, newPointOnLine];
  };

  render() {
    const centerCoordinate = [this.state.longitude, this.state.latitude];

    // If in Edit mode only display the features that aren't currently being edited in the main feature layer
    // and display the feature currently being edited in the selected feature layer
    const displayFeatures = this.props.mapMode === MapModes.EDIT ? this.state.featuresNotSelected : this.props.features;
    const displaySelectedFeatures = this.props.mapMode === MapModes.EDIT ? this.state.featuresSelected : this.props.featuresSelected;

    const mapProps = {
      ref: ref => this._map = ref,
      basemap: this.props.currentBasemap,
      centerCoordinate: centerCoordinate,
      onMapPress: this.onMapPress,
      onMapLongPress: this.onMapLongPress,
      features: turf.featureCollection(displayFeatures),
      selectedFeatures: turf.featureCollection(displaySelectedFeatures),
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
        {this.props.currentBasemap.id === 'custom' ? <CustomBasemap {...mapProps}/> : null}
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
    selectedSpot: state.spot.selectedSpot,
    features: state.spot.features,
    featuresSelected: state.spot.featuresSelected,
    currentBasemap: state.map.currentBasemap,
    map: state.map.map
  }
};

const mapDispatchToProps = {
  onFeaturesSelectedCleared: () => ({type: spotReducers.FEATURES_SELECTED_CLEARED}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  onFeatureAdd: (feature) => ({type: spotReducers.FEATURE_ADD, feature: feature}),
  onFeatureDelete: (id) => ({type: spotReducers.FEATURE_DELETE, id: id}),
  onFeaturesUpdated: (features) => ({type: spotReducers.FEATURES_UPDATED, features: features}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap})
};

export default connect(mapStateToProps, mapDispatchToProps)(mapView);
