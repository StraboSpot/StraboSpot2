import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import {connect} from 'react-redux';
import {TextInput} from 'react-native';

import IconButton from '../../../shared/ui/IconButton';

// Styles
import headerStyles from './NotebookHeader.styles';
import {spotReducers} from '../../../spots/Spot.constants';

const NotebookHeader = props => {

  const [spotName, setSpotName] = useState(props.spot.properties.name);

  // Creates DMS string for coordinates
  const getSpotCoordText = () => {
    if (props.spot.geometry.type === 'Point') {
      const lng = props.spot.geometry.coordinates[0];
      const lat = props.spot.geometry.coordinates[1];
      const degreeSymbol = '\u00B0';
      const latitude = lat.toFixed(6);
      let latitudeCardinal = Math.sign(lat) >= 0 ? 'North' : 'South';

      const longitude = lng.toFixed(6);
      let longitudeCardinal = Math.sign(lng) >= 0 ? 'East' : 'West';

      return longitude + degreeSymbol + ' ' + longitudeCardinal + ', ' + latitude + degreeSymbol + ' ' + latitudeCardinal;
    }
    return props.spot.geometry.type;
  };

  return (
    <View style={headerStyles.headerContentContainer}>
      <Image
        source={require('../../../assets/NotebookHeaderPoint.png')}
        style={headerStyles.headerImage}
      />
      <View style={headerStyles.headerSpotNameAndCoordsContainer}>
        <TextInput
          defaultValue={props.spot.properties.name}
          onChangeText={(text) => setSpotName(text)}
          onBlur={() => props.onSpotEdit('name', spotName)}
          style={headerStyles.headerSpotName}/>
        <Text style={headerStyles.headerCoords}>{getSpotCoordText()}</Text>
      </View>
      <View style={headerStyles.headerButtons}>
        <IconButton
          onPress={() => props.onPress('menu')}
          source={require('../../../assets/icons/StraboIcons_Oct2019/three-dot-menu.png')}
          style={headerStyles.threeDotMenu}
        />
      </View>
    </View>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
  };
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookHeader);

