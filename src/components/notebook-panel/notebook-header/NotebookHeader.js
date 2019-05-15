import React from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements/src/index';
import headerStyles from './/NotebookHeader.styles';
import IconButton from '../../../ui/IconButton';
import {connect} from 'react-redux';

const NotebookHeader = props => {
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
          <Text style={headerStyles.headerSpotName}>{props.spot.properties.name}</Text>
        </View>
        <View style={headerStyles.headerCoordsContainer}>
          <Text style={headerStyles.headerCoords}>{getSpotCoordText()}</Text>
        </View>
      </View>
      <View style={headerStyles.headerButtons}>
        <IconButton
          onPress={() => props.onPress('menu')}
          source={require('../../../assets/icons/app-icons-shaded/V2-56.png')}
          style={{width: 20, height: 25}}
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

export default connect(mapStateToProps)(NotebookHeader);

