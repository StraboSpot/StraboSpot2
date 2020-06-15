import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import * as turf from '@turf/turf/index';
import {connect, useSelector, useDispatch} from 'react-redux';
import {View} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

// Components
import {MapLayer1, MapLayer2} from './Basemaps';

// Hooks
import useSpotsHook from '../spots/useSpots';
import useMapsHook from './useMaps';

// Utilities
import {getNewUUID, isEmpty} from '../../shared/Helpers';

// Constants
import {LATITUDE, LONGITUDE, MapModes, geoLatLngProjection, pixelProjection} from './maps.constants';
import {MAPBOX_KEY} from '../../MapboxConfig';
import {mapReducers} from './maps.constants';
import {spotReducers} from '../spots/spot.constants';
import {projectReducers} from '../project/project.constants';

MapboxGL.setAccessToken(MAPBOX_KEY);

const Map = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [useMaps] = useMapsHook();
  const [useSpots] = useSpotsHook();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);

  // Data needing to be tracked when in editing mode
  const initialEditingModeData = {
    spotEditing: {},
    spotsEdited: [],
    spotsNotEdited: [],
    vertexToEdit: [],
  };

  // Props that change that needed to pass to the map component
  const initialMapPropsMutable = {
    allowMapViewMove: true,
    basemap: currentBasemap,
    centerCoordinate: [LONGITUDE, LATITUDE],
    drawFeatures: [],
    editFeatureVertex: [],
    imageBasemap: currentImageBasemap,
    spotsNotSelected: [],
    spotsSelected: [],
    coordQuad: [],
    zoomToSpot : false,
    zoom: 14,
  };

  const [editingModeData, setEditingModeData] = useState(initialEditingModeData);
  const [mapPropsMutable, setMapPropsMutable] = useState(initialMapPropsMutable);
  const [mapToggle, setMapToggle] = useState(true);

  const map = useRef(null);
  const camera = useRef(null);

  // Props that needed to pass to the map component
  const mapProps = {
    ...mapPropsMutable,
    ref: {mapRef: map, cameraRef: camera},
    onMapPress: (e) => onMapPress(e),
    onMapLongPress: (e) => onMapLongPress(e),
  };

  useEffect(() => {
    console.log('Changed image basemap to:', currentImageBasemap);
    const calculatedCoordQuad = currentImageBasemap ? useMaps.getCoordQuad(currentImageBasemap) : undefined;
    setMapPropsMutable(m => ({
      ...m,
      coordQuad: calculatedCoordQuad,
      imageBasemap: currentImageBasemap,
    }));
    setMapToggle(!mapToggle);
  }, [currentImageBasemap]);

  useEffect(() => {
    console.log('Changed current basemap to:', currentBasemap);
    const getCenter = async () => {
      const center = map && map.current ? await map.current.getCenter() : initialMapPropsMutable.centerCoordinate;
      const zoom = map && map.current ? await map.current.getZoom() : initialMapPropsMutable.zoom;
      setMapPropsMutable(m => ({
        ...m,
        basemap: currentBasemap,
        centerCoordinate: center,
        zoom: zoom,
      }));
      setMapToggle(!mapToggle);
    };
    getCenter();
  }, [currentBasemap]);

  useEffect(() => {
    console.log('Updating DOM on first render');
    if (!currentBasemap) useMaps.setCurrentBasemap();
    if (!currentImageBasemap) setCurrentLocationAsCenter();
    props.clearVertexes();
  }, []);

  useEffect(() => {
    console.log('Updating Spots, selected Spots, active datasets or basemap changed');
    setDisplayedSpots((isEmpty(props.selectedSpot) ? [] : [{...props.selectedSpot}]));
  }, [props.spots, props.selectedSpot, props.datasets, currentBasemap, currentImageBasemap]);

  useEffect(() => {
    // On change of selected spot, reset the zoomToSpot
    if (mapProps.zoomToSpot) {
      setMapPropsMutable(m => ({
        ...m,
        zoomToSpot: false,
      }));
      // On turning off the zoomToSpot, if not on imagebasemap,
      // zoomToSpot synchronously to current selected spot.
      // (turning off zoomToSpot, will move the camera to center coordinates, so reset the camera zoom to new selected spot's position.)
      if (!currentImageBasemap) zoomToSpot();
    }
  }, [props.selectedSpot]);

  useEffect(() => {
    console.log('Updating DOM on vertexEndsCoords changed');
    if (!isEmpty(props.vertexEndCoords && props.mapMode === MapModes.EDIT)) moveVertex();
  }, [props.vertexEndCoords]);

  useEffect(() => {
    // console.log('MapPropsMutable in useEffect', mapPropsMutable);
    if (props.mapMode === MapModes.DRAW.POINT && mapPropsMutable.drawFeatures.length === 1) props.endDraw();
  }, [mapPropsMutable.drawFeatures]);

  const moveVertex = async () => {
    try { // on imagebasemap, if spot is not point, conversion happens in editSpotCoordinates.
      const newVertexCoords = await map.current.getCoordinateFromView(props.vertexEndCoords);
      if (currentImageBasemap && editingModeData.spotEditing && turf.getType(editingModeData.spotEditing) === 'Point') {
        const vertexCoordinates = useMaps.convertCoordinateProjections(geoLatLngProjection, pixelProjection,
          [newVertexCoords[0], newVertexCoords[1]]);
        console.log('Move vertex to:', vertexCoordinates);
        editSpotCoordinates([vertexCoordinates[0], vertexCoordinates[1]]);
      }
      else {
        console.log('Move vertex to:', newVertexCoords);
        editSpotCoordinates(newVertexCoords);
      }
    }
    catch {
      console.log('Problem moving the vertex');
    }
  };

  // Set selected and not selected Spots to display when not editing
  const setDisplayedSpots = (selectedSpots) => {
    if (!currentImageBasemap) {
      let [selectedDisplayedSpots, notSelectedDisplayedSpots] = useMaps.getDisplayedSpots(selectedSpots);
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedDisplayedSpots],
        spotsNotSelected: [...notSelectedDisplayedSpots],
      }));
    }
    else {
      /* setDisplayedSpots, for an image basemap, we always show spots that
       have image_basemap as the the currentImageBasemapid and all the spots
       will have coordinates in image pixels. So, we need to convert the image pixels
       to lat,lng before we display them.
       */
      if (!currentImageBasemap) return;
      const mappableSpots = useMaps.getDisplayedSpots(selectedSpots);
      let selectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[0]));
      let notSelectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[1]));
      selectedMappableSpotsCopy = selectedMappableSpotsCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      notSelectedMappableSpotsCopy = notSelectedMappableSpotsCopy.map(
        spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedMappableSpotsCopy],
        spotsNotSelected: [...notSelectedMappableSpotsCopy],
      }));
    }
  };

  // Set selected and not selected Spots to display while editing
  const setDisplayedSpotsWhileEditing = (spotEditingTmp, spotsEditedTmp, spotsNotEditedTmp) => {
    spotsNotEditedTmp = spotsNotEditedTmp.filter(spot => spot.properties.id !== spotEditingTmp.properties.id);
    console.log('Set displayed Spots while editing. Editing:', spotEditingTmp, 'Edited:', spotsEditedTmp, 'Not edited:',
      spotsNotEditedTmp);
    if (!currentImageBasemap) {
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}],
        spotsNotSelected: [...spotsEditedTmp, ...spotsNotEditedTmp],
      }));
    }
    else { // if imagebasemap, then all the coordinates have to be converted.
      let spotsEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsEditedTmp) ? [] : spotsEditedTmp));
      let spotsNotEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsNotEditedTmp) ? [] : spotsNotEditedTmp));
      let spotEditingCopy = JSON.parse(JSON.stringify(isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}]));
      spotsEditedCopy = spotsEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotsNotEditedCopy = spotsNotEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotEditingCopy = spotEditingCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingCopy) ? [] : spotEditingCopy,
        spotsNotSelected: [...spotsEditedCopy, ...spotsNotEditedCopy],
      }));
    }
  };

  const setDrawFeatures = (features) => {
    console.log('Set draw features:', features);
    setMapPropsMutable(m => ({
      ...m,
      drawFeatures: features,
    }));
  };

  const setEditFeatures = (spotToEdit) => {
    // Get the draw features for the Spot (the individual vertex and lines that make up the Spot)
    let explodedFeatures = turf.explode(spotToEdit).features;
    // If polygon remove last exploded point because it is the same as the first
    if (turf.getType(spotToEdit) === 'Polygon') explodedFeatures.pop();
    explodedFeatures = explodedFeatures.map(feature => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          tempEditId: getNewUUID(),
        },
      };
    });
    if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
      if (turf.getType(spotToEdit) === 'Polygon' || turf.getType(spotToEdit) === 'LineString') {
        explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      }
    }
    setDrawFeatures(explodedFeatures);
  };

  const clearSelectedSpots = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpots([]);
    props.onClearSelectedSpots();
  };

  const clearSelectedSpotsWhileEditing = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpotsWhileEditing([], editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    props.onClearSelectedSpots();
  };

  // Mapbox: Handle map press
  const onMapPress = async (e) => {
    console.log('props', props);
    console.log('mapProps', mapProps);
    console.log('Map press detected:', e);
    console.log('Map mode:', props.mapMode);
    // Select/Unselect a feature
    if (props.mapMode === MapModes.VIEW) {
      console.log('Selecting or unselect a feature ...');
      const {screenPointX, screenPointY} = e.properties;
      const spotFound = await getSpotAtPress(screenPointX, screenPointY);
      if (!isEmpty(spotFound)) {
        useMaps.setSelectedSpot(spotFound);
        props.openNotebookOnSelectedSpot();
      }
      else clearSelectedSpots();
    }
    // Draw a feature
    else if (props.mapMode === MapModes.DRAW.POINT || props.mapMode === MapModes.DRAW.LINE
      || props.mapMode === MapModes.DRAW.POLYGON) {
      console.log('Drawing', props.mapMode, '...');
      let feature = {};
      const newCoord = turf.getCoord(e);
      // Draw a point for the last coordinate touched
      // const lastVertexPlaced = MapboxGL.geoUtils.makeFeature(e.geometry);
      const lastVertexPlaced = turf.point(e.geometry.coordinates);
      // Draw a point (if set point to current location not working)
      if (props.mapMode === MapModes.DRAW.POINT) setDrawFeatures([lastVertexPlaced]);
      else if (isEmpty(mapPropsMutable.drawFeatures)) setDrawFeatures([lastVertexPlaced]);
      // Draw a line given a point and a new point
      else if (mapPropsMutable.drawFeatures.length === 1) {
        const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
        const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);
        feature = turf.lineString([firstVertexPlacedCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      // Draw a line given a line and a new point
      else if (mapPropsMutable.drawFeatures.length > 1 && props.mapMode === MapModes.DRAW.LINE) {
        const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
        const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
        feature = turf.lineString([...lineCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      else if (mapPropsMutable.drawFeatures.length > 1 && props.mapMode === MapModes.DRAW.POLYGON) {
        const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
        const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);

        // Draw a polygon given a line and a new point
        if (turf.getType(mapPropsMutable.drawFeatures[1]) === 'LineString') {
          const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
          feature = turf.polygon([[...lineCoords, newCoord, firstVertexPlacedCoords]]);
        }
        // Draw a polygon given a polygon and a new point
        else {
          let polyCoords = turf.getCoords(mapPropsMutable.drawFeatures[1])[0];
          polyCoords.pop();
          feature = turf.polygon([[...polyCoords, newCoord, firstVertexPlacedCoords]]);
        }
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
    }
    // Edit a Spot
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
      const spotFound = await getSpotAtPress(screenPointX, screenPointY);
      if (isEmpty(editingModeData.spotEditing)) {
        if (isEmpty(spotFound)) console.log('No feature selected.');
        else setSelectedSpotToEdit(spotFound);
      }
      else {
        if (isEmpty(spotFound)) clearSelectedFeatureToEdit();
        else {
          const vertexSelected = await getDrawFeatureAtPress(screenPointX, screenPointY);
          console.log('vertexSelected', vertexSelected);
          if (isEmpty(vertexSelected)) {
            if (editingModeData.spotEditing.properties.id === spotFound.properties.id) clearSelectedFeatureToEdit();
            else {
              //if the spot is in already edited list, then get the spot from that list.
              let editedSpot = editingModeData.spotsEdited.find(spot => spot.properties.id === spotFound.properties.id);
              setSelectedSpotToEdit(isEmpty(editedSpot) ? spotFound : editedSpot);
            }
          }
          else setSelectedVertexToEdit(vertexSelected);
        }
      }
    }
    else {
      console.log('Error. Unknown map mode:', props.mapMode);
    }
  };

  const setSelectedSpotToEdit = (spotToEdit) => {
    console.log('setSelectedSpotToEdit spotToEdit', spotToEdit);
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit,
    }));
    console.log('Set Spot to edit:', spotToEdit);
    setDisplayedSpotsWhileEditing(spotToEdit, editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    setEditFeatures(spotToEdit);
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  const clearSelectedFeatureToEdit = () => {
    console.log('Clearing selected Spot.');
    clearSelectedSpotsWhileEditing();
    setDrawFeatures([]);
    clearSelectedVertexToEdit();                        // Not really needed here?
    console.log('Cleared selected Spot.');
  };

  const setSelectedVertexToEdit = async vertex => {
    console.log('setSelectedVertexToEdit, vertex:', vertex);
    props.clearVertexes();
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: vertex,
    }));
    console.log('Set vertex to edit:', vertex);
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [vertex],
      allowMapViewMove: false,
    }));
    if (currentImageBasemap && ((isEmpty(editingModeData.spotEditing) || (!isEmpty(
      editingModeData.spotEditing) && editingModeData.spotEditing.properties.name !== vertex.properties.name)))) {
      // spotEditing will be empty for Point and not empty for polygon or linestring, because, only Point can select the vertex on first long press.
      // For polygon or line, long press would identify the spot.
      // For polygon or LineString, the vertex comes from the draw feature, so, the coordinates are already in lat lng projection, so no more conversion necessary.

      // !isEmpty(editingModeData.spotEditing) && editingModeData.spotEditing.properties.name != vertex.properties.name)), this check is required
      // when a polygon/linestring is selected by a long press first then a different point than the points on polygon/line is selected to edit.
      const coords = vertex.geometry.coordinates;
      const [lat, lng] = useMaps.convertCoordinateProjections(pixelProjection, geoLatLngProjection,
        [coords[0], coords[1]]);
      const vertexCoordinates = await map.current.getPointInView([lat, lng]);
      props.setVertexStartCoords(vertexCoordinates);
    }
    else {
      const vertexCoordinates = await map.current.getPointInView(vertex.geometry.coordinates);
      props.setVertexStartCoords(vertexCoordinates);
    }
  };

  const clearSelectedVertexToEdit = () => {
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: {},
    }));
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [],
      allowMapViewMove: true,
    }));
    console.log('Cleared selected vertex to edit.');
    //if (turf.getType(spotsEditing[0]) === 'Point') clearSelectedFeatureToEdit();
    props.clearVertexes();
  };

  // Identify the vertex which has to be updated
  const getVertexIndexInSpotToEdit = (vertex) => {
    var indexOfCoordinatesToUpdate = [];
    for (let index = 0; index < mapPropsMutable.drawFeatures.length; index++) {
      if (mapPropsMutable.drawFeatures[index].properties.tempEditId === vertex.properties.tempEditId) {
        indexOfCoordinatesToUpdate.push(index);
      }
    }
    return indexOfCoordinatesToUpdate;
  };

  // Edit the coordinates of a selected feature
  const editSpotCoordinates = (newCoord) => {
    console.log('In editSpotCoordinates', newCoord);
    if (isEmpty(editingModeData.spotEditing)) console.log('No Spot to edit selected');
    else {
      if (!editingModeData.vertexToEdit) console.log('No vertex to edit selected');
      else {
        console.log('Editing Coordinate');
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        console.log('Feature Editing:', spotEditingCopy);
        let coords = {};
        try {
          coords = turf.getCoords(spotEditingCopy);
        }
        catch {
          console.warn('error use getCoords on spotEditingCopy', spotEditingCopy);
          coords = spotEditingCopy.geometry.coordinates;
        }
        let isModified = false;
        if (turf.getType(spotEditingCopy) === 'Point') {
          spotEditingCopy.geometry.coordinates = newCoord;
          isModified = true;
        }
          // identify the coordinates to edit, uses the tempEditId on drawFeatures and vertex to edit.
          // the index on drawFeatures array that matches with vertex to edit is the index of the coordinates to be edited
        // on the actual polygon or linestring.
        else {
          var indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(editingModeData.vertexToEdit);
          if (currentImageBasemap) {
            newCoord = useMaps.convertCoordinateProjections(geoLatLngProjection, pixelProjection, newCoord);
          }
          if (turf.getType(spotEditingCopy) === 'LineString') {
            for (let j = 0; j < coords.length; j++) {
              if (indexOfCoordinatesToUpdate.includes(j)) {
                spotEditingCopy.geometry.coordinates[j] = newCoord;
              }
            }
            isModified = true;
          }
          else if (turf.getType(spotEditingCopy) === 'Polygon') {
            if (indexOfCoordinatesToUpdate.includes(0)) {
              indexOfCoordinatesToUpdate.push(mapPropsMutable.drawFeatures.length);
              // if its first index, that needs to be edited, for a polygon, the last and first coordinates
              //point to the same one, so both should be updated.
            }
            for (let i = 0; i < coords.length; i++) {
              for (let j = 0; j < coords[i].length; j++) {
                if (indexOfCoordinatesToUpdate.includes(j)) {
                  spotEditingCopy.geometry.coordinates[i][j] = newCoord;
                  isModified = true;
                }
              }
            }
          }
        }
        if (isModified) {
          spotEditingCopy.properties.modified_timestamp = Date.now();
          console.log('Finished editing Spot. Edited Spot:', spotEditingCopy, 'mapProps.spotsSelected',
            mapProps.spotsSelected);
        }
        else console.warn('Problem editing Spot');
        console.log('Edited coords:', turf.getCoords(spotEditingCopy));
        let explodedFeatures = turf.explode(spotEditingCopy).features;
        // If polygon remove last exploded point because it is the same as the first
        if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
        explodedFeatures = explodedFeatures.map(feature => {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              tempEditId: getNewUUID(),
            },
          };
        });
        if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
          if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
            explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
          }
        }
        setDrawFeatures(explodedFeatures);
        const spotsEditedTmp = editingModeData.spotsEdited.filter(
          spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
        spotsEditedTmp.push(spotEditingCopy);
        const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
          spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
        setEditingModeData(d => ({
          ...d,
          spotEditing: spotEditingCopy,
          spotsEdited: spotsEditedTmp,
          spotsNotEdited: spotsNotEditedTmp,
        }));
        setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
        clearSelectedVertexToEdit();
        console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
        if (turf.getType(spotEditingCopy) === 'Point') clearSelectedFeatureToEdit();
      }
    }
  };

  const getCurrentBasemap = () => {
    return currentBasemap;
  };

  const getExtentString = async () => {
    const mapBounds = await map.current.getVisibleBounds();

    let right = mapBounds[0][0];
    let top = mapBounds[0][1];
    let left = mapBounds[1][0];
    let bottom = mapBounds[1][1];
    let extentString = left + ',' + bottom + ',' + right + ',' + top;

    //extentString = "-110.86973277578818,32.296336913128584,-110.86531862627777,32.30231710144568";

    return extentString;
  };

  const getCurrentZoom = async () => {
    console.log('Map.current', map);
    return await map.current.getZoom();
    // return 16;
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

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    await useMaps.setPointAtCurrentLocation();
  };

  // Fly the map to the current location
  const goToCurrentLocation = async () => {
    if (camera.current) {
      try {
        const currentLocation = await useMaps.getCurrentLocation();
        await camera.current.flyTo(currentLocation, 2500);
      }
      catch (err) {
        throw Error('Error Flying to Current Location', err);
      }
    }
    else throw Error('Error Getting Map Camera');
  };

  // Get the current location from the device and set it in the state as the map center
  const setCurrentLocationAsCenter = async () => {
    const currentLocation = await useMaps.getCurrentLocation();
    setMapPropsMutable(m => ({
      ...m,
      centerCoordinate: currentLocation,
    }));
  };

  const endDraw = async () => {
    console.log('endDraw mapProps', mapProps);
    let newOrEditedSpot = {};
    if (!isEmpty(mapPropsMutable.drawFeatures)) {
      let newFeature = mapPropsMutable.drawFeatures[0];  // If one, draw feature the Spot is just a point
      // If there is more than one draw feature (should be no more than three) the first is the first vertex
      // placed, the second is the line or polygon between the vertices, and the third is the last vertex placed
      // Grab the second feature to create the Spot
      if (mapPropsMutable.drawFeatures.length > 1) {
        newFeature = mapPropsMutable.drawFeatures.splice(1, 1)[0];
      }
      if (currentImageBasemap) { //create new spot for imagebasemap - needs lat long to pixel conversion.
        newFeature = useMaps.convertFeatureGeometryToImagePixels(newFeature);
        newFeature.properties.image_basemap = currentImageBasemap.id;
      }
      if (props.isSelectingForStereonet) {
        const mappedSpots = JSON.parse(JSON.stringify(mapPropsMutable.spotsNotSelected));
        const selectedSpots = useMaps.getLassoedSpots(mappedSpots, newFeature);
      }
      else {
        newOrEditedSpot = await useSpots.createSpot(newFeature);
        useMaps.setSelectedSpot(newOrEditedSpot);
      }
      setDrawFeatures([]);
    }
    console.log('Draw ended.');
    return Promise.resolve(newOrEditedSpot);
  };

  const cancelDraw = () => {
    setDrawFeatures([]);
    console.log('Draw canceled.');
  };

  const cancelEdits = async () => {
    console.log('Canceling editing...');
    if (!isEmpty(editingModeData.spotEditing)) {
      const spotOrig = props.spots[editingModeData.spotEditing.properties.id];
      setDisplayedSpots([spotOrig]);
      await props.onSetSelectedSpot(spotOrig);
    }
    else setDisplayedSpots([]);
    clearEditing();
  };

  const saveEdits = async () => {
    console.log('Saving edits...', 'spotsNotEdited', editingModeData.spotsNotEdited, 'spotsEdited',
      editingModeData.spotsEdited);
    if (isEmpty(editingModeData.spotEditing)) setDisplayedSpots([]);
    else {
      setDisplayedSpots([editingModeData.spotEditing]);
      await props.onSetSelectedSpot(editingModeData.spotEditing);
    }
    if (!isEmpty(editingModeData.spotsEdited)) {
      await props.onAddSpots([...editingModeData.spotsNotEdited, ...editingModeData.spotsEdited]);
    }
    clearEditing();
  };

  const clearEditing = () => {
    console.log('Clearing editing data...');
    props.clearVertexes();
    setEditingModeData(initialEditingModeData);
    setDrawFeatures([]);
    clearSelectedVertexToEdit();
  };

  const startEditing = (spotToEdit) => {
    props.startEdit();
    clearEditing();
    const mappableSpots = useSpots.getMappableSpots();
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit ? spotToEdit : {},
      spotsEdited: [],
      spotsNotEdited: mappableSpots,
    }));
    spotToEdit ? console.log('Set Spot to edit:', spotToEdit) : console.log('No Spot selected to edit.');
    setDisplayedSpotsWhileEditing(spotToEdit, [], mappableSpots);
    setEditFeatures(spotToEdit);
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  const onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const {screenPointX, screenPointY} = e.properties;
    const spotToEdit = await getSpotAtPress(screenPointX, screenPointY);
    const mappableSpots = useSpots.getMappableSpots();
    if (props.mapMode === MapModes.VIEW && !isEmpty(mappableSpots)) startEditing(spotToEdit);
    else if (props.mapMode === MapModes.EDIT) {
      if (isEmpty(spotToEdit)) console.log('Already in editing mode and no Spot found where pressed. No action taken.');
      else if (!isEmpty(editingModeData.spotEditing)) {
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        if (turf.getType(spotEditingCopy) === 'LineString' || turf.getType(spotEditingCopy) === 'Polygon') {
          const vertexSelected = await getDrawFeatureAtPress(screenPointX, screenPointY);
          if (spotEditingCopy.properties.id === spotToEdit.properties.id) {
            let vertexToEditThisScope = {};
            if (isEmpty(vertexSelected)) {
              console.log('Adding new vertex...');
              // To add a vertex to a line the new point selected must be on the line
              if (turf.getType(spotEditingCopy) === 'LineString' && !isEmpty(spotToEdit)) {
                if (currentImageBasemap) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  [spotEditingCopy, vertexToEditThisScope] = addVertexToLine(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                }
                else [spotEditingCopy, vertexToEditThisScope] = addVertexToLine(spotEditingCopy, e.geometry);
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon') {
                if (currentImageBasemap) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  spotEditingCopy = addVertexToPolygon(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                }
                else spotEditingCopy = addVertexToPolygon(spotEditingCopy, e.geometry);
              }
            }
            else {
              console.log('Deleting selected vertex...');
              const coords = turf.getCoords(spotEditingCopy);
              var indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(vertexSelected);
              let isModified = false;
              if (turf.getType(spotEditingCopy) === 'LineString' && coords.length > 2) {
                for (let i = 0; i < coords.length; i++) {
                  if (indexOfCoordinatesToUpdate.includes(i)) {
                    spotEditingCopy.geometry.coordinates.splice(i, 1);
                    isModified = true;
                  }
                }
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon' && coords[0].length > 4) {
                for (let i = 0; i < coords.length; i++) {
                  for (let j = 0; j < coords[i].length; j++) {
                    if (indexOfCoordinatesToUpdate.includes(j)) {
                      spotEditingCopy.geometry.coordinates[i].splice(j, 1);
                      isModified = true;
                    }
                  }
                }
                if (indexOfCoordinatesToUpdate.includes(0)) {
                  // when the first spot is deleted, update the last spot to the current first spot.
                  spotEditingCopy.geometry.coordinates[0][spotEditingCopy.geometry.coordinates[0].length - 1] = spotEditingCopy.geometry.coordinates[0][0];
                }
              }
              else console.log('Not enough vertices in selected feature to delete one.');
              if (isModified) {
                spotEditingCopy.properties.modified_timestamp = Date.now();
                console.log('Finished deleting vetex. Edited Spot:', spotEditingCopy);
              }
              else console.warn('Problem editing Spot');
            }
            console.log('Edited coords:', turf.getCoords(spotEditingCopy));
            let explodedFeatures = turf.explode(spotEditingCopy).features;
            // If polygon remove last exploded point because it is the same as the first
            if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
            explodedFeatures = explodedFeatures.map(feature => {
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  tempEditId: getNewUUID(),
                },
              };
            });
            if (currentImageBasemap) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
              if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
                explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
              }
            }
            setDrawFeatures(explodedFeatures);
            const spotsEditedTmp = editingModeData.spotsEdited.filter(
              spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
            spotsEditedTmp.push(spotEditingCopy);
            const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
              spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
            setEditingModeData(d => ({
              ...d,
              spotEditing: spotEditingCopy,
              spotsEdited: spotsEditedTmp,
              spotsNotEdited: spotsNotEditedTmp,
            }));
            setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
            clearSelectedVertexToEdit();
            //setSelectedVertexToEdit(vertexToEditThisScope);
            console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
          }
          else console.log('Invalid vertex selected. No action');
        }
        else console.log('Selected Spot is not a line or polygon. No action taken.');
      }
      else console.log('No feature selected. No action taken.');
    }
    else console.log('No Spots to edit. No action taken.');
  };

  // Get the Spot where screen was pressed
  const getSpotAtPress = async (screenPointX, screenPoint) => {
    console.log('mapMode in getSpotAtPress', props.mapMode);
    const spotLayers = ['pointLayerNotSelected', 'lineLayerNotSelected', 'polygonLayerNotSelected', 'pointLayerSelected', 'lineLayerSelected', 'polygonLayerSelected'];
    let spotFound = await getFeatureInRect(screenPointX, screenPoint, spotLayers);
    if (!isEmpty(spotFound)) {
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      // spotFound = props.spots[spotFound.properties.id];
      // spotFound = [...mapProps.spotsNotSelected, ...mapProps.spotsSelected].find(
      //   spot => spot.properties.id === spotFound.properties.id);
      spotFound = useSpots.getSpotById(spotFound.properties.id);
      console.log('Got Spot at press: ', spotFound);
    }
    return Promise.resolve(...[spotFound]);
  };

  // Get the feature from the draw layer where the screen was pressed
  const getDrawFeatureAtPress = async (screenPointX, screenPoint) => {
    console.log('mapMode in getDrawFeatureAtPress', props.mapMode);
    let drawFeatureFound = await getFeatureInRect(screenPointX, screenPoint, ['pointLayerDraw']);
    if (!isEmpty(drawFeatureFound)) {
      console.log('drawFeatureFound', drawFeatureFound, 'mapPropsMutable.drawFeatures', mapPropsMutable.drawFeatures);
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      const drawFeaturesCopy = [...mapPropsMutable.drawFeatures];
      drawFeatureFound = drawFeaturesCopy.find(
        feature => feature.properties.tempEditId === drawFeatureFound.properties.tempEditId);
      console.log('Got draw feature at press: ', drawFeatureFound, 'in Spot: ',
        props.spots[drawFeatureFound.properties.id]);
    }
    return Promise.resolve(...[drawFeatureFound]);
  };

  // Get the feature within a bounding box from a given layer, returning only the first one if there is more than one
  const getFeatureInRect = async (screenPointX, screenPointY, layers) => {
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await map.current.queryRenderedFeaturesInRect(bbox, null, layers);
    const featuresInRect = featureCollectionInRect.features;
    let featureFound = {};
    if (featuresInRect.length > 1) {
      const distances = await getDistancesFromSpot(screenPointX, screenPointY, featuresInRect);
      const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(distances);
      featureFound = featuresInRect[indexWithMinimumIndex];
    }
    else if (featuresInRect.length === 1) featureFound = featuresInRect[0];
    else console.log('No feature found where pressed.');
    return Promise.resolve(featureFound);
  };

  const getDistancesFromSpot = async (screenPointX, screenPointY, featuresInRect) => {
    const dummyFeature = {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Point',
        'coordinates': [screenPointX, screenPointY],
      },
    };
    var distances = [];
    var screenCoords = [];
    for (var i = 0; i < featuresInRect.length; i++) {
      if (featuresInRect[i].geometry.type === 'Polygon' || featuresInRect[i].geometry.type === 'LineString') {
        // trying to get a distance that is closest from the vertices of a polygon or line
        // to the dummy feature with screenX and screenY
        var explodedFeatures = turf.explode(featuresInRect[i]);
        var explodedFeaturesDistancesFromSpot = await getDistancesFromSpot(screenPointX, screenPointY,
          explodedFeatures.features);
        const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(explodedFeaturesDistancesFromSpot);
        distances[i] = distance;
      }
      else {
        var eachFeature = JSON.parse(JSON.stringify(featuresInRect[i]));
        screenCoords = await map.current.getPointInView(eachFeature.geometry.coordinates);
        eachFeature.geometry.coordinates = screenCoords;
        distances[i] = turf.distance(dummyFeature, eachFeature);
      }
    }
    return distances;
  };

  const getClosestSpotDistanceAndIndex = (distancesFromSpot) => {
    var minDistance = Number.MAX_VALUE;
    var minIndex = -1;
    for (var j = 0; j < distancesFromSpot.length; j++) {
      if (minDistance > distancesFromSpot[j]) { // trying to get the minimum distance
        minDistance = distancesFromSpot[j];
        minIndex = j;
      } // else we can ignore that feature.
    }
    return [minDistance, minIndex];
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

  const zoomToSpot = () => {
    if (props.selectedSpot && useMaps.isOnGeoMap(props.selectedSpot)) {
       // spot selected is on geomap, but currently on imagebasemap mode, turn off imagebasemap mode and zoomToSpot in async mode.
       if (currentImageBasemap){
         dispatch(({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined}));
         setMapPropsMutable(m => ({
           ...m,
           zoomToSpot: true,
         }));
       }
       // spot selected is on geomap and mapMode is main-map, zoomToSpot in sync mode.
       else useMaps.zoomToSpots([props.selectedSpot], map.current, camera.current);
    }
    else if (props.selectedSpot && props.selectedSpot.properties.image_basemap) {
       //spot selected is on imagebasemap, either if not on imagebasemap
       // or not on same imagebasemap as the selectedspot's imagebasemap,
       // then switch to corresponding imagebasemap and zoomToSpot in asyncMode
       if (!currentImageBasemap || currentImageBasemap.id !== props.selectedSpot.properties.image_basemap) {
         var imageBasemapData = Array.from(useSpots.getAllImageBaseMaps()).find(
          imgBasemap => imgBasemap.id === props.selectedSpot.properties.image_basemap);
         dispatch(({
           type: mapReducers.CURRENT_IMAGE_BASEMAP,
           currentImageBasemap: imageBasemapData,
         }));
         setMapPropsMutable(m => ({
           ...m,
           zoomToSpot: true,
         }));
       }
       //spot selected is already on the same imagebasemap, zoomToSpot in sync mode.
       else useMaps.zoomToSpots([props.selectedSpot], map.current, camera.current);
    }
    else {
          // handle other maps
    }
  };

  // Zoom map to the extent of the mapped Spots
  const zoomToSpotsExtent = () => {
    const spots = [...mapProps.spotsSelected, ...mapProps.spotsNotSelected];
    useMaps.zoomToSpots(spots, map.current, camera.current);
  };

  useImperativeHandle(props.mapComponentRef, () => {
    return {
      cancelDraw: cancelDraw,
      cancelEdits: cancelEdits,
      clearSelectedSpots: clearSelectedSpots,
      endDraw: endDraw,
      getCurrentBasemap: getCurrentBasemap,
      getCurrentZoom: getCurrentZoom,
      getExtentString: getExtentString,
      getTileCount: getTileCount,
      goToCurrentLocation: goToCurrentLocation,
      moveVertex: moveVertex,
      saveEdits: saveEdits,
      setPointAtCurrentLocation: setPointAtCurrentLocation,
      zoomToSpot: zoomToSpot,
      zoomToSpotsExtent: zoomToSpotsExtent,
    };
  });

  return (
    <View style={{flex: 1, zIndex: -1}}>
      {/* Switch identical layers to force basemap raster re-render based on mapToggle value*/}
      {mapProps.basemap && mapToggle && <MapLayer1  {...mapProps}/>}
      {mapProps.basemap && !mapToggle && <MapLayer2 {...mapProps}/>}
    </View>
  );
});

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.spot.selectedSpot,
    spots: state.spot.spots,
    vertexEndCoords: state.map.vertexEndCoords,
    datasets: state.project.datasets,
    deviceDimensions: state.home.deviceDimensions,
  };
};

const mapDispatchToProps = {
  clearVertexes: () => ({type: mapReducers.CLEAR_VERTEXES}),
  onAddSpot: (spot) => ({type: spotReducers.ADD_SPOT, spot: spot}),
  addDatasetId: (datasetId, spotId) => ({
    type: projectReducers.DATASETS.ADD_NEW_SPOT_ID_TO_DATASET,
    datasetId: datasetId,
    spotId: spotId,
  }),
  onAddSpots: (spots) => ({type: spotReducers.ADD_SPOTS, spots: spots}),
  onClearSelectedSpots: () => ({type: spotReducers.CLEAR_SELECTED_SPOTS}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
  setVertexStartCoords: (coords) => ({type: mapReducers.VERTEX_START_COORDS, vertexStartCoords: coords}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
