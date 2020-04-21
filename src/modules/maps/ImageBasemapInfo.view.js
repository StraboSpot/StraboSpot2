import React, { useState, useEffect, useRef } from 'react';
import {Button} from 'react-native-elements';
import { Directions, FlingGestureHandler, State } from 'react-native-gesture-handler';
import { ActivityIndicator, View, Animated,Alert } from 'react-native';
import { connect } from 'react-redux';
import * as turf from '@turf/turf/index';
import { Icon, Image } from 'react-native-elements';

// Other components
import { NotebookPages, notebookReducers } from '../notebook-panel/notebook.constants';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import notebookStyles from '../notebook-panel/notebookPanel.styles';
import NotebookPanelMenu from '../notebook-panel/NotebookPanelMenu';
import IconButton from '../../shared/ui/IconButton';

//Map related
import {MapModes} from './maps.constants';
import MapboxGL from '@react-native-mapbox-gl/maps';

// Constants
import { homeReducers } from '../home/home.constants';
import * as themes from '../../shared/styles.constants';
import { spotReducers } from '../spots/spot.constants';

// Hooks and helpers
import useImagesHook from '../images/useImages';
import useProjectHook from '../project/useProject';
import useSpotsHook from '../spots/useSpots';
import useMapsHook from './useMaps';
import { animatePanels, isEmpty } from '../../shared/Helpers';

// Styles
import { mapStyles } from './Basemaps';
import styles from '../home/home.style';

const ImageBasemapInfoView = (props) => {
  const [useImages] = useImagesHook()
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const [useMaps] = useMapsHook();
  const currentActiveSpots = useSpots.getActiveSpotsObj();
  const currentDataset = useProject.getCurrentDataset();
  //const [currentBasemap, setCurrentBasemap] = useState(props.currentBasemap);
  const [mapMode, setMapMode] = useState(MapModes.VIEW);
  const [buttons, setButtons] = useState({
    endDrawButtonVisible: false,
    drawButtonOn: undefined,
    drawButtonsVisible: true,
    editButtonsVisible: false,
  });
  
  const mapref = useRef(null);
  const notebookPanelWidth = 400;
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const animateNotebookMenu = { transform: [{ translateX: animation }] };
  
  const initialMapPropsMutable = {
    allowMapViewMove: true,
    drawFeatures: [],
    editFeatureVertex: [],
    spotsNotSelected: [],
    spotsSelected: [],
    coordQuad : [],
    screenCords:[],
    coordQuadsLoaded : false
  };
  const initialImageProps ={
    xRatio : 0, xTranslation:0, yRatio:0,
    yTranslation:0 ,imageProps: {},
    xCenter: 0,yCenter: 0, h: 0,w: 0,
    z: 0,l: 0,r: 0,t: 0,b: 0,imagePropsLoaded:false
  };
  const [imageProps, setImageProps] = useState(initialImageProps);
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const currentImageBasemapId = props.navigation.getParam('imageId', 'No-ID');
  const [mapPropsMutable, setMapPropsMutable] = useState(initialMapPropsMutable);
  const mapProps = {
    ...mapPropsMutable
   };
  
  /* getCoordQuad method identifies the coordinate span for the 
     for the image basemap. 
  */
  const getCoordQuad =  async () => {
    let imageProps = {};
    Object.values(props.spots).find(spot => {
      if (spot.properties.images) {
        for(var i=0; i<spot.properties.images.length;i++){
          if(spot.properties.images[i].id == currentImageBasemapId){
            imageProps = spot.properties.images[i];
            break;
          }
        }
      }
    });
    console.log('Image Basemap Props', imageProps);
    var [x, y] =await mapref.current.getPointInView([0, 0]);
    x=props.deviceDimensions.width/2;
    y=props.deviceDimensions.height/2;
    const h = imageProps.height;
    const w = imageProps.width;
    const imageScreenLengthRatio = props.deviceDimensions.height/h;
    const imageScreenWidthRatio = props.deviceDimensions.width/w;
    // We identify the left and right spans for the image using the 
    // center of the screen (device dimensions/2) and then subtracting
    // width of the image in terms of screen size.
    // (imageScreenWidthRatio and imageScreenLengthratio)
    const z = 0;  // zoom just have to play with this..
    var l = x + (w * imageScreenWidthRatio/ 2);
    var r = x - (w * imageScreenWidthRatio / 2);
    const b = y + (h * imageScreenLengthRatio / 2); //(since zero is at the top for Web Mercator pixels)
    const t = y - (h * imageScreenLengthRatio / 2);
    
    // identify the [lat,lng] corners of the image basemap using the map api
    var bottomLeft = await mapref.current.getCoordinateFromView([l, b]);
    var bottomRight = await mapref.current.getCoordinateFromView([r, b]);
    var topRight = await mapref.current.getCoordinateFromView([r, t]);
    var topLeft = await mapref.current.getCoordinateFromView([l, t]);
    
    // identify screen coordinates for that denote start and end for x and y axes.
    var imageStartScreenCords = await mapref.current.getPointInView(bottomLeft);
    var imageEndScreenCords = await mapref.current.getPointInView(topRight);
    // identify start and end coordinates for the image.
    const imageXStart = imageStartScreenCords[0];
    const imageYStart = imageStartScreenCords[1]; 
    const imageXEnd = imageEndScreenCords[0];
    const imageYEnd = imageEndScreenCords[1];
    //xRatio is the ratio between width of the image and screen length of the image
    //xRatio is useful for converting an image pixel to screen coordinate.
    var xRatio = (w/(imageXEnd-imageXStart));
    // xTranslation is the difference between the start points of the image.
    //screen x coordinate is 0 at start of the screen, but image starts at imageXStart
    // therefore we need to use xTranslation for conversions.
    var xTranslation = imageXStart;
    // similar xRatio, y Ratio is ratio between h of the image and screen height.
    // "-" because, screen coordinates start from top of screen, image pixels start from bottom.
    var yRatio = -(h/(imageYEnd-imageYStart)); 
    // screen coordinates start from top of screen, image pixels start from bottom.
    var yTranslation = h;
   
   setImageProps(i => ({
     ...i,
     xRatio : xRatio,
     xTranslation:xTranslation,
     yRatio:yRatio,
     yTranslation:yTranslation,
     imageProps: imageProps,
     xCenter: x,
     yCenter: y,
     h: h,
     w: w,
     z: z,
     l: l,
     r: r,
     t: t,
     b: b,
     imagePropsLoaded : true
   }));
   var imagePropsLocal = {
     xRatio : xRatio,
     xTranslation:xTranslation,
     yRatio:yRatio,
     yTranslation:yTranslation,
     imageProps: imageProps,
     xCenter: x,
     yCenter: y,
     h: h,
     w: w,
     z: z,
     l: l,
     r: r,
     t: t,
     b: b,
   };
   
   setMapPropsMutable(m => ({
     ...m,
     coordQuad: [topLeft, topRight, bottomRight,bottomLeft],
     coordQuadsLoaded : true
   }));  
 setDisplayedSpots(isEmpty(props.selectedSpot) ? [] : [{...props.selectedSpot}],imagePropsLocal);
 }

  useEffect(() => {
    if (mapMode === MapModes.DRAW.POINT && mapPropsMutable != undefined && mapPropsMutable.drawFeatures.length == 1) {
      endDraw();
    }
  }, [mapPropsMutable.drawFeatures]);

  useEffect(() => {
    console.log('Updating DOM on first render imgbasemap');
    setDisplayedSpots(isEmpty(props.selectedSpot) ? [] : [{ ...props.selectedSpot }]);
    props.setNotebookPanelVisible(false);
    props.setAllSpotsPanelVisible(false);
    props.setModalVisible(null);
    if(!mapProps.coordQuadsLoaded){
      getCoordQuad();
    }
  }, []);

  useEffect(() => {
    console.log('Updating DOM on change of selected spot details',props.selectedSpot.geometry,props.selectedSpot.properties,props.selectedSpot);
    setDisplayedSpots(isEmpty(props.selectedSpot) ? [] : [{ ...props.selectedSpot }]);
   }, [props.selectedSpot]);

   /* setDisplayedSpots, for an image basemap, we always show spots that
    have image_basemap as the the currentImageBasemapid and all the spots 
    will have coordinates in image pixels. So, we need to convert the image pixels
    to lat,lng before we display them.
   */
  const setDisplayedSpots = async (selectedSpots,imagePropsLocal) => {
    if(imagePropsLocal == undefined && imageProps.imagePropsLoaded ==false) return;
    const mappableSpots = useMaps.setDisplayedSpots(selectedSpots, currentImageBasemapId);
    let selectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[0]));
    let notSelectedMappableSpotsCopy = JSON.parse(JSON.stringify(mappableSpots[1]));
    [selectedMappableSpotsCopy,notSelectedMappableSpotsCopy] = await convertImagePixelsToLatLong(selectedMappableSpotsCopy,notSelectedMappableSpotsCopy,imagePropsLocal);
    if(selectedMappableSpotsCopy!=null && notSelectedMappableSpotsCopy!=null){
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedMappableSpotsCopy],
        spotsNotSelected: [...notSelectedMappableSpotsCopy],
      }));
    }
  };
  // convertImagePixelsToLatLng 
  const convertImagePixelsToLatLong = async(selectedMappableSpots,notSelectedMappableSpots,imagePropsLocal) => {
    var iData = imageProps;
    if(iData.imagePropsLoaded == false)
    {iData = imagePropsLocal;}
    notSelectedMappableSpots = await convertSpotsImageXYPixelsToLatLng(notSelectedMappableSpots, iData);
    selectedMappableSpots = await convertSpotsImageXYPixelsToLatLng(selectedMappableSpots, iData);
    return [selectedMappableSpots,notSelectedMappableSpots];
  }
  /*
  convertSpotsImageXYPixelsToLatLng, converts imagePixels to lat lng, such 
  that the map in the background can understand the spot geometry,
  inorder to display the properties.
  Conversion Logic, 
  imagePixel is divided by corresponding ratios and 
  then corresponding translations are applied to calculate the screen points.
  We then pass those screen points to map API to identify the lat lng.
  Similar logic is applied to different data structures, 
  according to their geometry type.
  */
  const convertSpotsImageXYPixelsToLatLng = async (spots, iData) => {
    var xRatio = iData.xRatio;
    var yRatio = iData.yRatio;
    const xTranslation = iData.xTranslation;
    const yTranslation = iData.yTranslation;
    var screenX,screenY;
    var convertedSpots =[];
    for(const spot of spots){
     if(Array.isArray(spot.geometry.coordinates[0])){
      var isLineStringCounter=0;
      var finalLatLngCoordinates = [];
      for(const subArray of spot.geometry.coordinates){
        isLineStringCounter++;
        screenX = (subArray[0] / xRatio) + xTranslation;
        screenY = (yTranslation - subArray[1]) / yRatio;
        let [lat,lng] =[];
        [lat,lng] = await mapref.current.getCoordinateFromView([screenX, screenY]);
        finalLatLngCoordinates.push([lat,lng]);
      }
      if(isLineStringCounter > 2){// polygon
        spot.geometry.coordinates = [finalLatLngCoordinates];
      }else{ // LineString
      spot.geometry.coordinates = finalLatLngCoordinates;
      }
    }else { //point
      screenX = (spot.geometry.coordinates[0] / xRatio) + xTranslation;
      screenY = (yTranslation - spot.geometry.coordinates[1]) / yRatio;
      let [lat,lng] = await mapref.current.getCoordinateFromView([screenX, screenY]);
      spot.geometry.coordinates = [lat,lng];
     }  
    convertedSpots.push(spot);
    };
    return convertedSpots;
};

  const deleteSpot = id => {
    const spot = props.spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            useSpots.deleteSpot(id)
              .then((res) => {
                console.log(res)
                closeNotebookPanel();
              });
          },
        },
      ],
    );
  };

  const clickHandler = (name, position) => {
    switch (name) {
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        if (!isEmpty(currentDataset)) setDraw(name);
        else Alert.alert('No Current Dataset', 'A current dataset needs to be set before drawing Spots.');
        break;
      case 'closeNotebook':
      closeNotebookPanel();
      break;
      case 'endDraw':
        endDraw();
        break;
        case 'deleteSpot':
          deleteSpot(props.selectedSpot.properties.id);
          break;
        
    }
  }
  const setDraw = async mapModeToSet => {
    cancelDraw();
    if (mapMode === MapModes.VIEW && mapModeToSet !== MapModes.DRAW.POINT) {
      toggleButton('endDrawButtonVisible', true);
    }
    else if (mapMode === mapModeToSet) mapModeToSet = MapModes.VIEW;

    setMapMode(mapModeToSet);

    if (mapModeToSet === MapModes.VIEW) {
      toggleButton('endDrawButtonVisible', false);
    }
    //props.setMapMode(mapModeToSet);
  };

  const toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !buttons[button]);
    setButtons({
      ...buttons,
      [button]: isVisible !== undefined ? isVisible : !buttons[button],
    });
  };

  const startEdit = () => {
    setMapMode(MapModes.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
  };

  const endDraw = async () => {
    const newOrEditedSpot = await mapEndDraw();
    setMapMode(MapModes.VIEW);
    toggleButton('endDrawButtonVisible', false);
    if (!isEmpty(newOrEditedSpot)) {
      openNotebookPanel(NotebookPages.OVERVIEW);
      props.setModalVisible(null);
    }

    setMapPropsMutable(m => ({
      ...m,
      screenCords: []
    }));
  };

  const openNotebookPanel = pageView => {
    console.log('notebook opening', pageView);
    props.setNotebookPageVisible(pageView);
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    props.setNotebookPanelVisible(true);
  };


  const mapEndDraw = async () => {
    let newOrEditedSpot = {};
    if (!isEmpty(mapPropsMutable.drawFeatures)) {
      let newFeature = mapPropsMutable.drawFeatures[0];  // If one, draw feature the Spot is just a point
      // If there is more than one draw feature (should be no more than three) the first is the first vertex
      // placed, the second is the line or polygon between the vertices, and the third is the last vertex placed
      // Grab the second feature to create the Spot
      if (mapPropsMutable.drawFeatures.length > 1) {
        newFeature = mapPropsMutable.drawFeatures.splice(1, 1)[0];
      }
      newOrEditedSpot = await useSpots.createSpot(newFeature, currentImageBasemapId, mapProps, imageProps);
      useMaps.setSelectedSpot(newOrEditedSpot);
      setDrawFeatures([]);
    } return newOrEditedSpot;
  }

  const getSpotAtPress = async (screenPointX, screenPoint) => {
    const spotLayers = ['pointLayerNotSelected', 'lineLayerNotSelected', 'polygonLayerNotSelected', 'pointLayerSelected', 'lineLayerSelected', 'polygonLayerSelected'];
    let spotFound = await getFeatureInRect(screenPointX, screenPoint, spotLayers);
    if (!isEmpty(spotFound)) {
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      // spotFound = props.spots[spotFound.properties.id];
      spotFound = [...mapProps.spotsNotSelected, ...mapProps.spotsSelected].find(
        spot => spot.properties.id === spotFound.properties.id);
      openNotebookPanel(NotebookPages.OVERVIEW);
      props.setModalVisible(null);

      console.log('Got Spot at press: ', spotFound);
    }
    return Promise.resolve(...[spotFound]);
  };

  const getFeatureInRect = async (screenPointX, screenPointY, layers) => {
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await mapref.current.queryRenderedFeaturesInRect(bbox, null, layers);
    
    const featuresInRect = featureCollectionInRect.features;
    let featureFound = {};
    if (featuresInRect.length > 0) {
      if (featuresInRect.length > 1) console.log('Multiple features were pressed:', featuresInRect);
      //   for(var i=0 ; i<featuresInRect.length; i++){
      //     if(featuresInRect[i].geometry.screenPointX == screenPointX 
      //       && featuresInRect[i].geometry.screenPointY == screenPointY){
      //         featureFound = featuresInRect[i];
      //         break;
      //       }
      //   }
      //  if(featureFound == undefined)
      featureFound = featuresInRect[0]; // Just use first feature, if more than one
    }
    else console.log('No feature found were pressed.');
    return Promise.resolve(featureFound);
  };
  const clearSelectedSpots = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpots([]);
    props.onClearSelectedSpots();
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };


  //this.onPress= this.onPress.bind(this);

  const onPress = async (e) => {
    console.log("featurecollect", turf.featureCollection(Array.from(currentActiveSpots)));
    //  console.log('mapProps', mapProps);
    console.log('Map mode:', mapMode);
    // Select/Unselect a feature
    const { screenPointX, screenPointY } = e.properties;
    if (mapMode === MapModes.VIEW) {
      console.log('Selecting or unselect a feature ...');
      const spotFound = await getSpotAtPress(screenPointX, screenPointY);
      if (!isEmpty(spotFound)) props.onSetSelectedSpot(spotFound);
      else clearSelectedSpots();
    }
    // Draw a feature
    else if (mapMode === MapModes.DRAW.POINT || mapMode === MapModes.DRAW.LINE
      || mapMode === MapModes.DRAW.POLYGON) {
      console.log('Drawing', mapMode, '...');
      let feature = {};
      const newCoord = turf.getCoord(e);
      if(mapPropsMutable.screenCords.length == 0){
        setMapPropsMutable(m => ({
          ...m,
          screenCords: [ e.properties.screenPointX, e.properties.screenPointY ],
        }));
      }else{
        var test = mapProps.screenCords;
        test.push(e.properties.screenPointX, e.properties.screenPointY );
        setMapPropsMutable(m => ({
          ...m,
          screenCords: test,
        }));
      }
      // Draw a point for the last coordinate touched
      //const lastVertexPlaced = MapboxGL.geoUtils.makeFeature(e.geometry);
      const lastVertexPlaced = turf.point(e.geometry.coordinates);
      // Draw a point (if set point to current location not working)
      if (mapMode === MapModes.DRAW.POINT) setDrawFeatures([lastVertexPlaced]);
      else if (isEmpty(mapPropsMutable.drawFeatures)) setDrawFeatures([lastVertexPlaced]);
      // Draw a line given a point and a new point
      else if (mapPropsMutable.drawFeatures.length === 1) {
        const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
        const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);
        feature = turf.lineString([firstVertexPlacedCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      else if (mapPropsMutable.drawFeatures.length > 1 && mapMode === MapModes.DRAW.LINE) {
        const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
        const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
        feature = turf.lineString([...lineCoords, newCoord]);
        setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
      }
      else if (mapPropsMutable.drawFeatures.length > 1 && mapMode === MapModes.DRAW.POLYGON) {
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
  }

  const cancelDraw = () => {
    setDrawFeatures([]);
    console.log('Draw canceled.');
  };

  const setDrawFeatures = (features) => {
    setMapPropsMutable(m => ({
      ...m,
      drawFeatures: features,
    }));
  };
  renderImage = () => {
    return (
      <Image
        source={{ uri: useImages.getLocalImageSrc(props.navigation.getParam('imageId', 'No-ID')) }}
        style={{ width: '100%', height: '100%' }}
        PlaceholderContent={<ActivityIndicator />}
      />
    );
  }


  const modalHandler = (page, modalType) => {
    if (props.isNotebookPanelVisible) {
      closeNotebookPanel();
      props.setModalVisible(modalType);
    }
    else {
      openNotebookPanel(page);
      props.setModalVisible(modalType);
    }
  };
  const notebookPanel =
    <FlingGestureHandler
      direction={Directions.RIGHT}
      numberOfPointers={1}
      // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
      onHandlerStateChange={ev => flingHandlerNotebook(ev)}>
      <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
        <NotebookPanel
          onHandlerStateChange={(ev, name) => flingHandlerNotebook(ev, name)}
          closeNotebook={closeNotebookPanel}
          textStyle={{ fontWeight: 'bold', fontSize: 12 }}
          onPress={name => notebookClickHandler(name)} />
      </Animated.View>
    </FlingGestureHandler>;

  const flingHandlerNotebook = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      console.log('FLING TO CLOSE NOTEBOOK!', nativeEvent);
      animatePanels(animation, notebookPanelWidth);
      animatePanels(rightsideIconAnimationValue, 0);
      props.setNotebookPanelVisible(false);
      props.setAllSpotsPanelVisible(false);
    }
  };
  const notebookClickHandler = name => {
    switch (name) {
      case 'menu':
        toggleDialog('notebookPanelMenuVisible');
        break;
      case 'export':
        console.log('Export button was pressed');
        break;
      case 'camera':
        launchCameraFromNotebook();
        break;
    }
  };

  const toggleDialog = dialog => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const closeNotebookPanel = () => {
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    props.setNotebookPanelVisible(false);
    props.setAllSpotsPanelVisible(false);
  };
  
  return (
    <View style={{ flex: 1, zIndex: 0, flexDirection: 'row' }}>
      <MapboxGL.MapView
        //id={currentBasemap.id}
        ref={mapref}
        animated={true}
        compassEnabled={true}
        mapMode={mapMode}
        startEdit={startEdit}
        endDraw={endDraw}
        onPress={onPress}
        scrollEnabled={false}
        style={{ flex: 1 }}
        continuousWorld = {false}
        noWrap={true}
        maxBounds={[ [-180, -85], [180, 85] ]}
      >
      <MapboxGL.Camera/>
      <MapboxGL.Animated.ImageSource
        key="d"
        id="radarSource"
        coordinates={mapProps.coordQuad}
        url={useImages.getLocalImageSrc(props.navigation.getParam('imageId', 'No-ID'))}>
        <MapboxGL.RasterLayer id='imageBasemapLayer'
                          style={{rasterOpacity: .7 }}/>
      </MapboxGL.Animated.ImageSource>

      <MapboxGL.ShapeSource
        id='shapeSource'
        shape={turf.featureCollection(mapProps.spotsNotSelected)}
      >
        <MapboxGL.CircleLayer
          id='pointLayerNotSelected'
          filter={['==', '$type', 'Point']}
          style={mapStyles.point}
        />
        <MapboxGL.LineLayer
          id='lineLayerNotSelected'
          filter={['==', '$type', 'LineString']}
          style={mapStyles.line}
        />
        <MapboxGL.FillLayer
          id='polygonLayerNotSelected'
          filter={['==', '$type', 'Polygon']}
          style={mapStyles.polygon}
        />
      </MapboxGL.ShapeSource>
      
      <MapboxGL.ShapeSource
        id='spotsNotSelectedSource'
        shape={turf.featureCollection(mapProps.spotsSelected)}
      >
        <MapboxGL.CircleLayer
          id='pointLayerSelected'
          filter={['==', '$type', 'Point']}
          style={mapStyles.pointSelected}
        />
        <MapboxGL.LineLayer
          id='lineLayerSelected'
          filter={['==', '$type', 'LineString']}
          style={mapStyles.lineSelected}
        />
        <MapboxGL.FillLayer
          id='polygonLayerSelected'
          filter={['==', '$type', 'Polygon']}
          style={mapStyles.polygonSelected}
        />
      </MapboxGL.ShapeSource>
      
      <MapboxGL.ShapeSource
        id='drawFeatures'
        shape={turf.featureCollection(mapProps.drawFeatures == undefined ? [] : mapProps.drawFeatures)}
      >
        <MapboxGL.CircleLayer
          id='pointLayerDraw'
          filter={['==', '$type', 'Point']}
          style={mapStyles.pointDraw}
        />
        <MapboxGL.LineLayer
          id='lineLayerDraw'
          filter={['==', '$type', 'LineString']}
          style={mapStyles.lineDraw}
        />
        <MapboxGL.FillLayer
          id='polygonLayerDraw'
          filter={['==', '$type', 'Polygon']}
          style={mapStyles.polygonDraw}
        />
      </MapboxGL.ShapeSource>
        
      <MapboxGL.ShapeSource
        id='editFeatureVertex'
        shape={turf.featureCollection([])}
      >
        <MapboxGL.CircleLayer
          id='pointLayerEdit'
          filter={['==', '$type', 'Point']}
          style={mapStyles.pointEdit}
        />
      </MapboxGL.ShapeSource>
    </MapboxGL.MapView>
    <View style={{ fontWeight: 'bold', borderRadius: 100, backgroundColor: themes.SECONDARY_BACKGROUND_COLOR, position: 'absolute', left: 20, top: 30 }}>
      <Icon
        name={'close'}
        type={'antdesign'}
        color={themes.BLUE}
        size={35}
        onPress={() => {
          props.navigation.goBack();
        }}
      /></View>
    <View style={{ flexDirection: 'row', fontWeight: 'bold', position: 'absolute', left: 0, bottom: 50 }}>
      <IconButton
        style={{ top: 5 }}
        source={mapMode === MapModes.DRAW.POINT ?
          require('../../assets/icons/PointButton_pressed.png') : require(
            '../../assets/icons/PointButton.png')}
        onPress={clickHandler.bind(this, MapModes.DRAW.POINT)}
      />
      <IconButton
        style={{ top: 5 }}
        source={mapMode === MapModes.DRAW.LINE ?
          require('../../assets/icons/LineButton_pressed.png') : require(
            '../../assets/icons/LineButton.png')}
        onPress={clickHandler.bind(this, MapModes.DRAW.LINE)}
      />
      <IconButton
        style={{ top: 5 }}
        source={mapMode === MapModes.DRAW.POLYGON ?
          require('../../assets/icons/PolygonButton_pressed.png') :
          require('../../assets/icons/PolygonButton.png')}
        onPress={clickHandler.bind(this, MapModes.DRAW.POLYGON)}
      /></View>
    <View>
      {notebookPanel}
    </View>
    <NotebookPanelMenu
      visible={dialogs.notebookPanelMenuVisible}
      onPress={(name, position) => dialogClickHandler('notebookPanelMenuVisible', name, position)}
      onTouchOutside={() => toggleDialog('notebookPanelMenuVisible')}
    />
      <View style={styles.topCenter}>
      {buttons.endDrawButtonVisible ?
        <Button
          containerStyle={{alignContent: 'center'}}
          buttonStyle={styles.drawToolsButtons}
          titleStyle={{color: 'black'}}
          title={'End Draw'}
          onPress={clickHandler.bind(this, 'endDraw')}
        />
        : null}
      {buttons.editButtonsVisible ?
        <View>
          <Button
            buttonStyle={styles.drawToolsButtons}
            titleStyle={{color: 'black'}}
            title={'Save Edits'}
            onPress={clickHandler.bind(this, 'saveEdits')}
          />
          <Button
            buttonStyle={[styles.drawToolsButtons, {marginTop: 5}]}
            titleStyle={{color: 'black'}}
            title={'Cancel Edits'}
            onPress={clickHandler.bind(this, 'cancelEdits')}
          />
        </View>
        : null}
    </View>
  </View>
  );
};


const mapStateToProps = (state) => {
  return {
    currentBasemap: state.map.currentBasemap,
    selectedSpot: state.spot.selectedSpot,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    spots: state.spot.spots,
    deviceDimensions: state.home.deviceDimensions,
  };
};

const mapDispatchToProps = {
  setDeviceDims: (dims) => ({ type: homeReducers.DEVICE_DIMENSIONS, dims: dims }),
  setNotebookPageVisible: (page) => ({ type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page }),
  setModalVisible: (modal) => ({ type: homeReducers.SET_MODAL_VISIBLE, modal: modal }),
  setNotebookPanelVisible: (value) => ({ type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value }),
  onSetSelectedSpot: (spot) => ({ type: spotReducers.SET_SELECTED_SPOT, spot: spot }),
  onClearSelectedSpots: () => ({ type: spotReducers.CLEAR_SELECTED_SPOTS }),
  setAllSpotsPanelVisible: (value) => ({ type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value }),
  deleteSpot: (id) => ({type: spotReducers.DELETE_SPOT, id: id}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageBasemapInfoView);
