import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import {connect} from 'react-redux';
import {TextInput} from 'react-native';

import IconButton from '../../../ui/IconButton';

// Styles
import headerStyles from './NotebookHeader.styles';
import {EDIT_SPOT_PROPERTIES} from "../../../store/Constants";

const NotebookHeader = props => {

  const [spotName, setSpotName] = useState(props.spot.properties.name);

  // Creates DMS string for coordinates
  const getSpotCoordText = () => {
    if (props.spot.geometry.type === 'Point') {
      const lng = props.spot.geometry.coordinates[0];
      const lat = props.spot.geometry.coordinates[1];
      const degreeSymbol = '\u00B0';
      const latitude = lat.toFixed(6);
      let latitudeCardinal = Math.sign(lat) >= 0 ? "North" : "South";

      const longitude = lng.toFixed(6);
      let longitudeCardinal = Math.sign(lng) >= 0 ? "East" : "West";

      return longitude + degreeSymbol + ' ' + longitudeCardinal + ', ' + latitude + degreeSymbol + ' ' + latitudeCardinal;
    }
    return props.spot.geometry.type;
  };

  return (
    <View style={headerStyles.headerContentContainer}>
      <View style={headerStyles.headerSymbolIcon}>
        <Image
          source={require('../../../assets/icons/PointButton_pressed_resized1.png')}
          style={headerStyles.headerImage}
        />
      </View>
      <View style={headerStyles.headerSpotNameAndCoordsContainer}>
        <View style={headerStyles.headerSpotNameContainer}>
          <TextInput
            defaultValue={props.spot.properties.name}
            onChangeText={() => setSpotName(text)}
            onBlur={() => props.onSpotEdit('name', spotName)}
            style={headerStyles.headerSpotName}/>
        </View>
        <View style={headerStyles.headerCoordsContainer}>
          <Text style={headerStyles.headerCoords}>{getSpotCoordText()}</Text>
        </View>
      </View>
      <View style={headerStyles.headerButtons}>
        <IconButton
          onPress={() => props.onPress('menu')}
          source={require('../../../assets/icons/app-icons-shaded/V2-56.png')}
          style={{width: 20, height: 20}}
        />
      </View>
    </View>
  )
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookHeader);

