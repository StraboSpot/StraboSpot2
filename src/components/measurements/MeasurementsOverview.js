import React from 'react';
import {FlatList, View} from 'react-native';
import {connect} from "react-redux";

import MeasurementItem from "./MeasurementItem";

const MeasurementsOverview = props => (
  <View>
    <FlatList
      data={props.spot.properties.orientation_data}
      renderItem={item => <MeasurementItem item={item}/>}
      keyExtractor={(item, index) => index.toString()}
    />
  </View>
);

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot
  }
}

export default connect(mapStateToProps)(MeasurementsOverview);

