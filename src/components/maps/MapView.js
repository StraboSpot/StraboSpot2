import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {MAPBOX_KEY} from '../../MapboxConfig';
import {CustomBasemap, MapboxOutdoorsBasemap, MapboxSatelliteBasemap, OSMBasemap, MacrostratBasemap} from './Basemaps';
import * as turf from '@turf/turf/index';
import {LATITUDE, LONGITUDE, MapModes} from './Map.constants';
import {connect} from 'react-redux';
import {getNewId} from '../../shared/Helpers';
import {mapReducers} from './Map.constants';
import {spotReducers} from '../../spots/Spot.constants';
import {truncDecimal} from '../../shared/Helpers';
import {homeReducers} from '../../views/home/Home.constants';
import {NotebookPages, notebookReducers} from '../notebook-panel/Notebook.constants';
import Geolocation from '@react-native-community/geolocation';

MapboxGL.setAccessToken(MAPBOX_KEY);

const mapView = React.forwardRef((props, ref) => {

  const [latitude, setLatitude] = useState(LATITUDE);
  const [longitude, setLongitude] = useState(LONGITUDE);
  const [currentBasemap, setCurrentBasemap] = useState({});
  const [drawFeatures, setDrawFeatures] = useState([]);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [featuresNotSelected, setFeaturesNotSelected] = useState([]);
  const [featuresSelected, setFeaturesSelected] = useState([]);
  const [vertexToEdit, setVertexToEdit] = useState({});

  const basemaps = {
    osm: {
      id: 'osm',
      layerId: 'osmLayer',
      layerLabel: 'OSM Streets',
      layerSaveId: 'osm',
      url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxZoom: 16,
    },
    macrostrat: {
      id: 'macrostrat',
      layerId: 'macrostratLayer',
      layerLabel: 'Geology from Macrostrat',
      layerSaveId: 'macrostrat',
      url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
      maxZoom: 19,
    },
    mapboxOutdoors: {
      id: 'mapboxOutdoors',
      layerId: 'mapboxOutdoorsLayer',
      layerLabel: 'Mapbox Topo',
      layerSaveId: 'mapbox.outdoors',
      url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
      maxZoom: 19,
    },
    mapboxSatellite: {
      id: 'mapboxSatellite',
      layerId: 'mapboxSatelliteLayer',
      layerLabel: 'Mapbox Satellite',
      layerSaveId: 'mapbox.satellite',
      url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
      maxZoom: 19,
    },
  };

  const _map = useRef(null);
  const camera = useRef(null);

  useEffect(() => {
    setCurrentLocation()
      .catch(err => console.log(err));
    console.log('Setting initial basemap ...', basemaps.mapboxOutdoors);
    props.onCurrentBasemap(basemaps.mapboxOutdoors);
  }, []);

  useEffect(() => {
    console.log('use effect for props.vertexEndCoords');
    moveVertex();
  }, [props.vertexEndCoords]);

  useEffect(() => {
    console.log('Draw Features', drawFeatures);
  }, [drawFeatures]);

  const moveVertex = async () => {
    try {
      const newVertexCoords = await _map.current.getCoordinateFromView(props.vertexEndCoords);
      console.log('Move vertex to:', newVertexCoords);
      editFeatureCoordinates(newVertexCoords);
    }
    catch {
      console.log('Problem moving the vertex');
    }
  };

  // Mapbox: Handle map press
  const onMapPress = async (e) => {
    console.log('Map press detected:', e);
    console.log('Map mode:', props.mapMode);
    // Select/Unselect a feature
    if (props.mapMode === MapModes.VIEW) {
      const {screenPointX, screenPointY} = e.properties;
      const featureSelected = await getFeatureAtPress(screenPointX, screenPointY);
      if (Object.getOwnPropertyNames(featureSelected).length > 0) props.onFeatureSelected(featureSelected);
      else props.onFeaturesSelectedCleared();
    }
    // Draw a feature
    else if (props.mapMode === MapModes.DRAW.POINT || props.mapMode === MapModes.DRAW.LINE
      || props.mapMode === MapModes.DRAW.POLYGON) {
      console.log('Drawing', props.mapMode, '...');
      let feature = {};
      const newCoord = turf.getCoord(e);
      // Draw a point for the last coordinate touched
      const lastVertexPlaced = MapboxGL.geoUtils.makeFeature(e.geometry);
      // Draw a point (if set point to current location not working)
      if (props.mapMode === MapModes.DRAW.POINT) setDrawFeatures([lastVertexPlaced]);
      else if (drawFeatures.length === 0) setDrawFeatures([lastVertexPlaced]);
      // Draw a line given a point and a new point
      else if (drawFeatures.length === 1) {
        const firstVertexPlaced = drawFeatures[0];
        const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);
        feature = turf.lineString([firstVertexPlacedCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      // Draw a line given a line and a new point
      else if (drawFeatures.length > 1 && props.mapMode === MapModes.DRAW.LINE) {
        const firstVertexPlaced = drawFeatures[0];
        const lineCoords = turf.getCoords(drawFeatures[1]);
        feature = turf.lineString([...lineCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      else if (drawFeatures.length > 1 && props.mapMode === MapModes.DRAW.POLYGON) {
        const firstVertexPlaced = drawFeatures[0];
        const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);

        // Draw a polygon given a line and a new point
        if (turf.getType(drawFeatures[1]) === 'LineString') {
          const lineCoords = turf.getCoords(drawFeatures[1]);
          feature = turf.polygon([[...lineCoords, newCoord, firstVertexPlacedCoords]]);
        }
        // Draw a polygon given a polygon and a new point
        else {
          let polyCoords = turf.getCoords(drawFeatures[1])[0];
          polyCoords.pop();
          feature = turf.polygon([[...polyCoords, newCoord, firstVertexPlacedCoords]]);
        }
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
    }
    // Edit a feature
    else if (props.mapMode === MapModes.EDIT) {
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
      const editFeatureSelected = await getFeatureAtPress(screenPointX, screenPointY);
      if (featuresSelected.length === 0) {
        //const editFeatureSelected = await getFeatureAtPress(screenPointX, screenPointY);
        if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) console.log('No feature selected.');
        else setSelectedFeatureToEdit(editFeatureSelected);
      }
      else {
        //if (Object.getOwnPropertyNames(vertexToEdit).length === 0) {
        if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) clearSelectedFeatureToEdit();
        else {
          const vertexSelected = await getDrawFeatureAtPoint(screenPointX, screenPointY);
          if (Object.getOwnPropertyNames(vertexSelected).length === 0) {
            if (featuresSelected[0].properties.id === editFeatureSelected.properties.id) {
              clearSelectedFeatureToEdit();
            }
            else setSelectedFeatureToEdit(editFeatureSelected);
          }
          else setSelectedVertexToEdit(vertexSelected);
        }
        /*}
         else {
         const vertexSelected = await getDrawFeatureAtPoint(screenPointX, screenPointY);
         if (Object.getOwnPropertyNames(vertexSelected).length === 0) editFeatureCoordinates(e.geometry);
         else {
         if (vertexToEdit.properties.id === vertexSelected.properties.id) {
         clearSelectedVertexToEdit();
         }
         else setSelectedVertexToEdit(vertexSelected);
         }
         }*/
      }
    }
    else {
      console.log('Error. Unknown map mode:', props.mapMode);
    }
  };

  const setSelectedFeatureToEdit = (feature) => {
    props.clearVertexes();
    props.onFeatureSelected(feature);
    let featuresNotSelectedThisScope = [];
    if (featuresNotSelected.length === 0 && featuresSelected.length === 0) {
      featuresNotSelectedThisScope = props.features.filter(
        featureInFilter => featureInFilter.properties.id !== feature.properties.id);
    }
    else {
      featuresNotSelectedThisScope = featuresNotSelected.filter(
        featureInFilter => featureInFilter.properties.id !== feature.properties.id);
    }
    let drawFeaturesThisScope = turf.explode(feature).features;
    // If polygon remove last exploded point because it is the same as the first
    if (turf.getType(feature) === 'Polygon') drawFeaturesThisScope.pop();
    setDrawFeatures(drawFeaturesThisScope);
    setFeaturesNotSelected([...featuresNotSelectedThisScope, ...featuresSelected]);
    setFeaturesSelected([feature]);
    console.log('Set feature to edit:', feature);
    if (turf.getType(feature) === 'Point') setSelectedVertexToEdit(feature);
  };

  const clearSelectedFeatureToEdit = () => {
    props.clearVertexes();
    props.onFeaturesSelectedCleared();
    setDrawFeatures([]);
    setFeaturesNotSelected([...featuresNotSelected, ...featuresSelected]);
    setFeaturesSelected([]);
    setVertexToEdit({});                         // Not really needed here?
    console.log('Cleared selected feature.');
  };

  const setSelectedVertexToEdit = async vertex => {
    props.clearVertexes();
    setVertexToEdit(vertex);
    console.log('Set vertex to edit:', vertex);
    const vertexCoordinates = await _map.current.getPointInView(vertex.geometry.coordinates);
    props.setVertexStartCoords(vertexCoordinates);
  };

  const clearSelectedVertexToEdit = () => {
    setVertexToEdit({});
    console.log('Cleared selected vertex to edit.');
    if (turf.getType(featuresSelected[0]) === 'Point') clearSelectedFeatureToEdit();
    props.clearVertexes();
  };

  const drawFeature = (feature) => {
    if (drawFeatures.length > 2) {
      drawFeatures.pop();
      drawFeatures.pop();
    }
    setDrawFeatures(drawFeatures.concat(feature));
  };

  // Edit the coordinates of a selected feature
  const editFeatureCoordinates = (newCoord) => {
    if (!featuresSelected || featuresSelected.length <= 0) console.log('No feature selected');
    else {
      if (!vertexToEdit) console.log('No vertex to edit selected');
      else {
        console.log('Editing Coordinate');
        let featureEditing = featuresSelected[0];
        console.log('Feature Editing:', featureEditing);
        const coords = turf.getCoords(featureEditing);

        const coordToEdit = turf.getCoords(vertexToEdit);
        // const newCoord = turf.getCoord(newGeometry);
        // console.log('Original coords:', coords, 'Coord to edit:', coordToEdit, 'New coord:', newCoord);
        // if (turf.getType(featureEditing) === 'Point') featureEditing.geometry = newGeometry;
        if (turf.getType(featureEditing) === 'Point') featureEditing.geometry.coordinates = newCoord;
        else if (turf.getType(featureEditing) === 'LineString') {
          for (let i = 0; i < coords.length; i++) {
            if (truncDecimal(coords[i][0]) === truncDecimal(coordToEdit[0])
              && truncDecimal(coords[i][1]) === truncDecimal(coordToEdit[1])) {
              // featureEditing.geometry.coordinates[i] = turf.getCoord(newGeometry);
              featureEditing.geometry.coordinates[i] = newCoord;
            }
          }
        }
        else if (turf.getType(featureEditing) === 'Polygon') {
          for (let i = 0; i < coords.length; i++) {
            for (let j = 0; j < coords[i].length; j++) {
              if (truncDecimal(coords[i][j][0]) === truncDecimal(coordToEdit[0])
                && truncDecimal(coords[i][j][1]) === truncDecimal(coordToEdit[1])) {
                // featureEditing.geometry.coordinates[i][j] = turf.getCoord(newGeometry);
                featureEditing.geometry.coordinates[i][j] = turf.getCoord(newCoord);
              }
            }
          }
        }
        console.log('Edited coords:', turf.getCoords(featureEditing));
        let drawFeatures = turf.explode(featureEditing).features;
        // If polygon remove last exploded point because it is the same as the first
        if (turf.getType(featureEditing) === 'Polygon') drawFeatures.pop();
        setDrawFeatures(drawFeatures);
        setFeaturesSelected([featureEditing]);
        setVertexToEdit({});
        console.log('Finished editing feature. Selected Feature: ', featuresSelected);
        props.clearVertexes();
        if (turf.getType(featureEditing) === 'Point') clearSelectedFeatureToEdit();
      }
    }
  };

  const getCurrentBasemap = () => {
    return props.currentBasemap;
  };

  const getExtentString = async () => {
    const mapBounds = await _map.current.getVisibleBounds();

    let right = mapBounds[0][0];
    let top = mapBounds[0][1];
    let left = mapBounds[1][0];
    let bottom = mapBounds[1][1];
    let extentString = left + ',' + bottom + ',' + right + ',' + top;

    return extentString;
  };

  const getCurrentZoom = async () => {
    //const currentZoom = await _map.current.getZoom();
    //return currentZoom;
    return 16;
  };

  const getTileCount = async (zoomLevel) => {
    var extentString = await getExtentString();
    try {
      //Assign the promise unresolved first then get the data using the json method.
      console.log('sending this extent to server: ', extentString);
      console.log('sending zoom to server: ', zoomLevel);
      const tileCountApiCall = await fetch(
        'http://tiles.strabospot.org/zipcount?extent=' + extentString + '&zoom=' + zoomLevel);
      const tileCountThisScope = await tileCountApiCall.json();
      console.log('got count from server: ', tileCountThisScope);
      return tileCountThisScope.count;
    }
    catch (err) {
      console.log('Error fetching data from tile count service.', err);
    }
  };

  // Create a new feature in the feature collection
  const createFeature = async (feature) => {
    feature.properties.id = getNewId();
    let d = new Date(Date.now());
    d.setMilliseconds(0);
    feature.properties.date = d.toISOString();
    // Sets modified and viewed timestamps in milliseconds
    feature.properties.modified_timestamp = Date.now();
    feature.properties.viewed_timestamp = Date.now();
    feature.properties.name = 'Spot ' + props.features.length;
    console.log('Creating new feature:', feature);
    await props.onFeatureAdd(feature);
    props.onFeatureSelected(feature);
    props.setNotebookPageVisible(NotebookPages.OVERVIEW);
    props.setModalVisible(null);
    console.log('Finished creating new feature. Features: ', props.features);
  };

  const changeMap = (mapName) => {
    if (mapName === 'mapboxSatellite' || mapName === 'mapboxOutdoors' || mapName === 'osm' || mapName === 'macrostrat') {
      console.log('Switching basemap to:', mapName);
      props.onCurrentBasemap(basemaps[mapName]);
    }
    else console.log('Cancel switching basemaps. Basemap', mapName, 'still needs to be setup.');
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    await setCurrentLocation();
    let feature = MapboxGL.geoUtils.makePoint([longitude, latitude]);
    createFeature(feature);
    // throw Error('Geolocation Error');
  };

  // Fly the map to the current location
  const goToCurrentLocation = async () => {
    if (camera.current) {
      try {
        await camera.current.flyTo([longitude, latitude], 12000);
      }
      catch (err) {
        throw Error('Error Flying to Current Location', err);
      }
    }
    else throw Error('Error Flying to Current Location');
  };

  // Get the current location from the device and set it in the state
  const setCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          console.log('Got Current Location:', latitude, ',', longitude);
          resolve();
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions,
      );
    });
  };

  const endDraw = () => {
    createFeature(drawFeatures.splice(1, 1)[0]);
    setDrawFeatures([]);
    console.log('Draw ended.');
  };

  const cancelDraw = () => {
    setDrawFeatures([]);
    console.log('Draw canceled.');
  };

  const cancelEdits = () => {
    props.onFeaturesSelectedCleared();
    props.clearVertexes();
    setIsEditingFeature(false);
    setDrawFeatures([]);
    setFeaturesNotSelected([]);
    setFeaturesSelected([]);
    setVertexToEdit({});
    console.log('Edit canceled.');
  };

  const saveEdits = () => {
    props.onFeaturesUpdated([...featuresNotSelected, ...featuresSelected]);
    props.clearVertexes();
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  const onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const editFeatureSelected = await getFeatureAtPress(screenPointX, screenPointY);
    if (props.mapMode === MapModes.VIEW) {
      props.startEdit();
      if (Object.getOwnPropertyNames(editFeatureSelected).length === 0) {
        setDrawFeatures([]);
        setFeaturesNotSelected(props.features);
        setFeaturesSelected([]);
        console.log('No features set feature to edit.');
      }
      else setSelectedFeatureToEdit(editFeatureSelected);
    }
    else if (props.mapMode === MapModes.EDIT) {
      if (featuresSelected.length > 0) {
        let featureSelected = featuresSelected[0];
        if (turf.getType(featureSelected) === 'LineString' || turf.getType(featureSelected) === 'Polygon') {
          const vertexSelected = await getDrawFeatureAtPoint(screenPointX, screenPointY);
          let vertexToEditThisScope = {};
          if (Object.getOwnPropertyNames(vertexSelected).length === 0) {
            // To add a vertex to a line the new point selected must be on the line
            if (turf.getType(featureSelected) === 'LineString' && Object.getOwnPropertyNames(
              editFeatureSelected).length !== 0 && featureSelected.properties.id === editFeatureSelected.properties.id) {
              [featureSelected, vertexToEditThisScope] = addVertexToLine(featureSelected, e.geometry);
            }
            else if (turf.getType(featureSelected) === 'Polygon') {
              featureSelected = addVertexToPolygon(featureSelected, e.geometry);
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
          setDrawFeatures(turf.explode(featureSelected).features);
          setFeaturesSelected([featureSelected]);
          setVertexToEdit(vertexToEditThisScope);
          console.log('Set selected feature:', featureSelected);
        }
        else console.log('Selected feature is not a line or polygon. No action taken.');
      }
      else console.log('No feature selected. No action taken.');
    }
    else console.log('Not in View or Edit modes. No action taken.');
  };

  // Get the feature at a point from the draw layer
  const getDrawFeatureAtPoint = async (screenPointX, screenPoint) => {
    return await getFeatureAtPress(screenPointX, screenPoint, ['pointLayerDraw']);
  };

  // Get the feature within a bounding box from a given layer, returning only the first one if there is more than one
  // If no layer is provided use the main feature layers and the selected layers
  const getFeatureAtPress = async (screenPointX, screenPointY, layers) => {
    console.log('screenpoints', screenPointX, screenPointY);
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    if (!layers) layers = ['pointLayer', 'lineLayer', 'polygonLayer', 'pointLayerSelected', 'lineLayerSelected', 'polygonLayerSelected'];
    const featureCollectionInRect = await _map.current.queryRenderedFeaturesInRect(bbox, null, layers);
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
  const addVertexToPolygon = (polygon, newVertexGeom) => {
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
  const addVertexToLine = (line, newVertexGeom) => {
    console.log('Adding vertex to selected line feature...');
    const newPointOnLine = turf.nearestPointOnLine(line, newVertexGeom);
    const i = newPointOnLine.properties.index;
    line.geometry.coordinates.splice(i + 1, 0, newPointOnLine.geometry.coordinates);
    return [line, newPointOnLine];
  };


  const centerCoordinate = [longitude, latitude];

  // If in Edit mode only display the features that aren't currently being edited in the main feature layer
  // and display the feature currently being edited in the selected feature layer
  const displayFeatures = props.mapMode === MapModes.EDIT ? featuresNotSelected : props.features;
  const displaySelectedFeatures = props.mapMode === MapModes.EDIT ? featuresSelected : props.featuresSelected;

  const mapProps = {
    ref: {mapRef: _map, cameraRef: camera},
    basemap: props.currentBasemap,
    centerCoordinate: centerCoordinate,
    onMapPress: onMapPress,
    onMapLongPress: onMapLongPress,
    features: turf.featureCollection(displayFeatures),
    selectedFeatures: turf.featureCollection(displaySelectedFeatures),
    drawFeatures: turf.featureCollection(drawFeatures),
    //editFeatureVertex: turf.featureCollection([vertexToEdit])  // ToDo Why doesn't this work?
    editFeatureVertex: Object.getOwnPropertyNames(vertexToEdit).length > 0 ?
      turf.featureCollection([vertexToEdit]) : MapboxGL.geoUtils.makeFeatureCollection(),
    allowMapViewMove: Object.getOwnPropertyNames(vertexToEdit).length === 0,
  };

  useImperativeHandle(props.mapComponentRef, () => {
    return {
      cancelDraw: cancelDraw,
      cancelEdits: cancelEdits,
      changeMap: changeMap,
      endDraw: endDraw,
      getCurrentBasemap: getCurrentBasemap,
      getCurrentZoom: getCurrentZoom,
      getExtentString: getExtentString,
      getTileCount: getTileCount,
      goToCurrentLocation: goToCurrentLocation,
      saveEdits: saveEdits,
      setCurrentLocation: setCurrentLocation,
      setPointAtCurrentLocation: setPointAtCurrentLocation,
    };
  });

  return (
    <View style={{flex: 1, zIndex: -1}}>
      {props.currentBasemap.id === 'mapboxSatellite' ? <MapboxSatelliteBasemap {...mapProps}/> : null}
      {props.currentBasemap.id === 'mapboxOutdoors' ? <MapboxOutdoorsBasemap {...mapProps}/> : null}
      {props.currentBasemap.id === 'osm' ? <OSMBasemap {...mapProps}/> : null}
      {props.currentBasemap.id === 'macrostrat' ? <MacrostratBasemap {...mapProps}/> : null}
      {props.currentBasemap.id === 'custom' ? <CustomBasemap {...mapProps}/> : null}
    </View>
  );

});

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.spot.selectedSpot,
    features: state.spot.features,
    featuresSelected: state.spot.featuresSelected,
    currentBasemap: state.map.currentBasemap,
    map: state.map.map,
    vertexEndCoords: state.map.vertexEndCoords,
  };
};

const mapDispatchToProps = {
  clearVertexes: () => ({type: mapReducers.CLEAR_VERTEXES}),
  onFeaturesSelectedCleared: () => ({type: spotReducers.FEATURES_SELECTED_CLEARED}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  onFeatureAdd: (feature) => ({type: spotReducers.FEATURE_ADD, feature: feature}),
  onFeatureDelete: (id) => ({type: spotReducers.FEATURE_DELETE, id: id}),
  onFeaturesUpdated: (features) => ({type: spotReducers.FEATURES_UPDATED, features: features}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setVertexStartCoords: (coords) => ({type: mapReducers.VERTEX_START_COORDS, vertexStartCoords: coords}),
};

export default connect(mapStateToProps, mapDispatchToProps)(mapView);
