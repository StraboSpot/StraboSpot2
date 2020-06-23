import React, {useState} from 'react';
import {Button} from 'react-native-elements';
import {Image, TextInput, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

// Components
import IconButton from '../../../shared/ui/IconButton';

// Styles
import headerStyles from './notebookHeader.styles';

// Utilities
import {toTitleCase} from '../../../shared/Helpers';

// Constants
import {labelDictionary} from '../../form/form.constants';
import {spotReducers} from '../../spots/spot.constants';

//hooks
import useSpotsHook from '../../spots/useSpots';

const NotebookHeader = props => {
  const dispatch = useDispatch();
  const [useSpots] = useSpotsHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const [spotName, setSpotName] = useState(spot.properties.name);

  const getSpotCoordText = () => {
    if (spot.geometry && spot.geometry.type) {
      // Creates DMS string for Point coordinates
      if (spot.geometry.type === 'Point') {
        let lng = spot.geometry.coordinates[0];
        let lat = spot.geometry.coordinates[1];
        let latitude = lat.toFixed(6);
        let longitude = lng.toFixed(6);
        if (spot.properties.image_basemap) {
          let pixelDetails = longitude + ' Xpx, ' + latitude + ' Ypx';
          let rootSpotDetails;
          if (!spot.properties.lat) {
            const rootSpot = useSpots.findRootSpot(spot.properties.image_basemap);
            if (rootSpot && rootSpot.geometry) {
              lng = rootSpot.geometry.coordinates[0];
              lat = rootSpot.geometry.coordinates[1];
            }
            else rootSpotDetails = 'unavailable';
          }
          else {
            lng = spot.properties.lng;
            lat = spot.properties.lat;
          }
          latitude = lat.toFixed(6);
          longitude = lng.toFixed(6);
          if (!rootSpotDetails) rootSpotDetails = getLatLngText(latitude, longitude, lat, lng);
          if (!rootSpotDetails || rootSpotDetails === 'unavailable') return pixelDetails; else return rootSpotDetails + '\n' + pixelDetails;
        }
        else return getLatLngText(latitude, longitude, lat, lng);
      }
      else if ((spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString') &&
        spot.properties.trace && spot.properties.trace.trace_feature && spot.properties.trace.trace_type) {
        return getTraceText();
      }
      else if ((spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiPolygon' ||
        spot.geometry.type === 'GeometryCollection') &&
        spot.properties.surface_feature && spot.properties.surface_feature.surface_feature_type) {
        return getSurfaceFeatureText();
      }
      return spot.geometry.type;
    }
    else return undefined;
  };

  const getLatLngText = (latitude, longitude, lat, lng) => {
    const degreeSymbol = '\u00B0';
    let latitudeCardinal = Math.sign(lat) >= 0 ? 'North' : 'South';
    let longitudeCardinal = Math.sign(lng) >= 0 ? 'East' : 'West';
    return longitude + degreeSymbol + ' ' + longitudeCardinal + ', ' + latitude + degreeSymbol + ' ' + latitudeCardinal;
  };

  const getSpotGemometryIcon = () => {
    if (spot.geometry && spot.geometry.type) {
      if (spot.geometry.type === 'Point') return require('../../../assets/icons/NotebookHeaderPoint.png');
      else if (spot.geometry.type === 'LineString') return require('../../../assets/icons/NotebookHeaderLine.png');
      else if (spot.geometry.type === 'Polygon') return require('../../../assets/icons/NotebookHeaderPolygon.png');
    }
    else return require('../../../assets/icons/NotebookHeaderUnknown.png');
  };

  const getTraceText = () => {
    const traceDictionary = labelDictionary.general.trace;
    const key = spot.properties.trace.trace_type;
    let traceText = traceDictionary[key] || key.replace(/_/g, ' ');
    traceText = toTitleCase(traceText) + ' Trace';
    const traceSubTypeFields = ['contact_type', 'geologic_structure_type', 'geomorphic_feature', 'antropogenic_feature', 'other_feature'];
    const subType = traceSubTypeFields.find(subTypeField => spot.properties.trace[subTypeField]);
    if (subType) {
      const subTypeValue = spot.properties.trace[subType];
      const subTypeLabel = traceDictionary[subTypeValue];
      if (subTypeLabel) traceText = traceText + ' - ' + subTypeLabel.toUpperCase();
    }
    return traceText;
  };

  const getSurfaceFeatureText = () => {
    const surfaceFeatureDictionary = labelDictionary.general.surface_feature;
    const key = spot.properties.surface_feature.surface_feature_type;
    let surfaceFeatureText = surfaceFeatureDictionary[key] || key.replace(/_/g, ' ');
    if (spot.properties.surface_feature.surface_feature_type === 'other' &&
      spot.properties.surface_feature.other_surface_feature_type) {
      surfaceFeatureText = spot.properties.surface_feature.other_surface_feature_type;
    }
    return toTitleCase(surfaceFeatureText);
  };

  const onSpotEdit = (field, value) => {
    dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value});
  };

  return (
    <View style={headerStyles.headerContentContainer}>
      <Image
        source={getSpotGemometryIcon()}
        style={headerStyles.headerImage}
      />
      <View style={headerStyles.headerSpotNameAndCoordsContainer}>
        <TextInput
          defaultValue={spot.properties.name}
          onChangeText={(text) => setSpotName(text)}
          onBlur={() => onSpotEdit('name', spotName)}
          style={headerStyles.headerSpotName}/>
        {getSpotCoordText() ?
          <Button
            type='clear'
            title={getSpotCoordText()}
            buttonStyle={{padding: 0, justifyContent: 'flex-start'}}/> :
          <View style={{flexDirection: 'row'}}>
            {!spot.properties.trace && !spot.properties.surface_feature &&
            <Button
              type='clear'
              title={'Set To Current Location'}
              titleStyle={{fontSize: 14}}
              buttonStyle={{padding: 0}}
              onPress={() => props.onPress('setToCurrentLocation')}/>
            }
            <Button
              type='clear'
              title={'Set in Current View'}
              titleStyle={{fontSize: 14}}
              buttonStyle={{padding: 0, paddingLeft: spot.properties.trace || spot.properties.surface_feature ? 0 : 40}}
              onPress={() => props.onPress('setFromMap')}/>
          </View>
        }
      </View>
      <View>
        <IconButton
          onPress={() => props.onPress('menu')}
          source={require('../../../assets/icons/three-dot-menu.png')}
          style={headerStyles.threeDotMenu}
        />
      </View>
    </View>
  );
};

export default NotebookHeader;

