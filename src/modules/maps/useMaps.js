import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';

const useMaps = (props) => {
  const dispatch = useDispatch();
  const deviceDimensions = useSelector(state => state.home.deviceDimensions);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const spots = useSelector(state => state.spot.spots);
  const [useSpots] = useSpotsHook();
  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await getCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
    // throw Error('Geolocation Error');
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
          console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions,
      );
    });
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    var mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    if(currentImageBasemap != undefined){ // if image_basemap, then filter spots by imageBasemap id
      mappableSpots = useSpots.getMappableSpots(currentImageBasemap.id);
    }
    // Filter out Spots on an strat section
    var displayedSpots = mappableSpots.filter(spot => !spot.properties.strat_section);
    if(currentImageBasemap == undefined){
      // Filter out Spots on an image_basemap
      displayedSpots = displayedSpots.filter(spot => !spot.properties.image_basemap);
    }
    console.log('Mappable Spots', selectedSpots);

    let mappedFeatures = [];
    displayedSpots.map(spot => {
      if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
        spot.properties.orientation_data.map((orientation, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          delete feature.properties.orientation_data;
          orientation.associated_orientation && orientation.associated_orientation.map(associatedOrientation => {
            feature.properties.orientation = associatedOrientation;
            mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
          });
          feature.properties.orientation = orientation;
          //feature.properties.orientation_num = i.toString();
          mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
        });
      }
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });

    console.log('mp', mappedFeatures);

    // Separate selected Spots and not selected Spots (Point Spots need to in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedDisplayedSpots = displayedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedDisplayedSpots = mappedFeatures.filter(spot => !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');

    console.log('Selected Spots to Display on this Map:', selectedDisplayedSpots);
    console.log('Not Selected Spots to Display on this Map:', notSelectedDisplayedSpots);
    return [selectedDisplayedSpots, notSelectedDisplayedSpots];
  };

  const setSelectedSpot = (spotToSetAsSelected) => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    let [selectedSpots,notSelectedSpots] = getDisplayedSpots(isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}]);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
    return [selectedSpots,notSelectedSpots]
  };
/* getBasemapImageProps, identifies the image being used as the imageBasemap and retrieves its properties*/
const getBasemapImageProps = () => {
  let basemapImageProps = {};
  if(spots == undefined || spots == null || currentImageBasemap == undefined) return [];
  Object.values(spots).find(spot => {
    if (spot.properties.images) {
      for(var i=0; i<spot.properties.images.length;i++){
        if(spot.properties.images[i].id == currentImageBasemap.id){
          basemapImageProps = spot.properties.images[i];
          break;
        }
      }
    }
  });
  console.log('Current Basemap Image Properties', basemapImageProps);
  return basemapImageProps;
}  

/* getCoordQuad method identifies the coordinate span for the 
   for the image basemap. 
*/
 const getCoordQuad = async (map, basemapImageProps) => {
  var [x, y] =await map.getPointInView([0, 0]); // this doesn't work every time, so using device dimensions for now.
  x=deviceDimensions.width/2;
  y=deviceDimensions.height/2;
  const h = basemapImageProps.height;
  const w = basemapImageProps.width;
  const imageScreenLengthRatio = deviceDimensions.height/h;
  const imageScreenWidthRatio = deviceDimensions.width/w;
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
  var bottomLeft = await map.getCoordinateFromView([l, b]);
  var bottomRight = await map.getCoordinateFromView([r, b]);
  var topRight = await map.getCoordinateFromView([r, t]);
  var topLeft = await map.getCoordinateFromView([l, t]);
  var coordQuad = [topLeft, topRight, bottomRight,bottomLeft];
return coordQuad;
}
/* calculateImageBasemapProps, calculates the actual translation components for this imagebasemap */
const calculateImageBasemapProps = async (map,calculatedCoordQuad,basemapImageProps) => {
    var [x, y] =await map.getPointInView([0, 0]); // this doesn't work every time, so using device dimensions for now.
    x=deviceDimensions.width/2;
    y=deviceDimensions.height/2;
    const h = basemapImageProps.height;
    const w = basemapImageProps.width;
    // identify screen coordinates for that denote start and end for x and y axes.
    var imageStartScreenCords = await map.getPointInView(calculatedCoordQuad[3]);//bottomLeft
    var imageEndScreenCords = await map.getPointInView(calculatedCoordQuad[1]);//topRight
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
    var z = 0; // place holder for zoom
    var imageBasemapProps = {
     xRatio : xRatio,
     xTranslation:xTranslation,
     yRatio:yRatio,
     yTranslation:yTranslation,
     basemapImageProps: basemapImageProps,
     xCenter: x,
     yCenter: y,
     h: h,
     w: w,
     z: z
   };
   return imageBasemapProps;
}

// convertImagePixelsToLatLng 
  const convertImagePixelsToLatLong = async(map,selectedMappableSpots,notSelectedMappableSpots,imageBasemapProps) => {
    notSelectedMappableSpots = await convertSpotsImageXYPixelsToLatLng(map, notSelectedMappableSpots, imageBasemapProps);
    selectedMappableSpots = await convertSpotsImageXYPixelsToLatLng(map, selectedMappableSpots, imageBasemapProps);
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
  const convertSpotsImageXYPixelsToLatLng = async (map, spots, iData) => {
    var xRatio = iData.xRatio;
    var yRatio = iData.yRatio;
    const xTranslation = iData.xTranslation;
    const yTranslation = iData.yTranslation;
    var screenX,screenY;
    var convertedSpots =[];
    for(const spot of spots){
      if(spot.geometry.type != ("Point")){
        var finalLatLngCoordinates = [];
        if(spot.geometry.type == ("Polygon")){
          for(const subArray of spot.geometry.coordinates){
            for(const innerSubArray of subArray){
              screenX = (innerSubArray[0] / xRatio) + xTranslation;
              screenY = (yTranslation - innerSubArray[1]) / yRatio;
              let [lat,lng] =[];
              [lat,lng] = await map.getCoordinateFromView([screenX, screenY]);
              finalLatLngCoordinates.push([lat,lng]);
            }
          }
          spot.geometry.coordinates = [finalLatLngCoordinates]; 
       }else{
          for(const subArray of spot.geometry.coordinates){
            screenX = (subArray[0] / xRatio) + xTranslation;
            screenY = (yTranslation - subArray[1]) / yRatio;
            let [lat,lng] =[];
            [lat,lng] = await map.getCoordinateFromView([screenX, screenY]);
            finalLatLngCoordinates.push([lat,lng]);
          }
          spot.geometry.coordinates = finalLatLngCoordinates;
        }
    }else { //point
      screenX = (spot.geometry.coordinates[0] / xRatio) + xTranslation;
      screenY = (yTranslation - spot.geometry.coordinates[1]) / yRatio;
      let [lat,lng] = await map.getCoordinateFromView([screenX, screenY]);
      spot.geometry.coordinates = [lat,lng];
     }  
    convertedSpots.push(spot);
    };
    return convertedSpots;
};
  return [{
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    getBasemapImageProps : getBasemapImageProps,
    getCoordQuad : getCoordQuad,
    convertImagePixelsToLatLong, convertImagePixelsToLatLong,
    calculateImageBasemapProps : calculateImageBasemapProps
  }];
};

export default useMaps;
