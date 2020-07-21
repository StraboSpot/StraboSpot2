import React, {useState} from 'react';
import {Image, TextInput, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {labelDictionary} from '../../form';
import {spotReducers} from '../../spots/spot.constants';
import useSpotsHook from '../../spots/useSpots';
import headerStyles from './notebookHeader.styles';

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
        if (spot.properties.image_basemap) {
          let pixelDetails = lng.toFixed(6) + ' Xpx, ' + lat.toFixed(6) + ' Ypx';
          if (isEmpty(spot.properties.lat) || isEmpty(spot.properties.lng)) {
            const rootSpot = useSpots.findRootSpot(spot.properties.image_basemap);
            if (rootSpot && rootSpot.geometry) {
              lng = rootSpot.geometry.coordinates[0];
              lat = rootSpot.geometry.coordinates[1];
              return getLatLngText(lat, lng) + '\n' + pixelDetails;
            }
          }
          else {
            lng = spot.properties.lng;
            lat = spot.properties.lat;
            return getLatLngText(lat, lng) + '\n' + pixelDetails;
          }
          return pixelDetails;
        }
        else return getLatLngText(lat, lng);
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

  const getLatLngText = (lat, lng) => {
    const degreeSymbol = '\u00B0';
    let latitudeCardinal = Math.sign(lat) >= 0 ? 'North' : 'South';
    let longitudeCardinal = Math.sign(lng) >= 0 ? 'East' : 'West';
    return lng.toFixed(6) + degreeSymbol + ' ' + longitudeCardinal + ', ' +
      lat.toFixed(6) + degreeSymbol + ' ' + latitudeCardinal;
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
        source={useSpots.getSpotGemometryIconSource(spot)}
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
            titleStyle={{textAlign: 'left'}}
            buttonStyle={{padding: 0, justifyContent: 'flex-start'}}
            onPress={() => props.onPress('showGeographyInfo')}/> :
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
          source={require('../../../assets/icons/MapActions.png')}
          style={headerStyles.threeDotMenu}
        />
      </View>
    </View>
  );
};

export default NotebookHeader;

