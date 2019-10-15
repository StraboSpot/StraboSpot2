import React from 'react';
import {FlatList, View} from 'react-native';
import {connect} from "react-redux";

import MeasurementItem from "./MeasurementItem";
import {NotebookPages, notebookReducers} from "../notebook-panel/Notebook.constants";
import {spotReducers} from "../../spots/Spot.constants";

const MeasurementsOverview = (props) => {
  const onMeasurementPressed = (item) => {
    props.setSelectedAttributes([item]);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };

  return (
    <View>
      <FlatList
        data={props.spot.properties.orientation_data}
        renderItem={item => <MeasurementItem item={item}
                                             selectedIds={[]}
                                             onPress={() => onMeasurementPressed(item.item)}/>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot
  }
}

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsOverview);

