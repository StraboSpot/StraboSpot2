import React from 'react';
import {FlatList, View} from 'react-native';
import {connect} from "react-redux";

import MeasurementItem from "./MeasurementItem";
import {NotebookPages, notebookReducers} from "../notebook-panel/Notebook.constants";
import {formReducers} from "../form/Form.constant";

const MeasurementsOverview = (props) => {
  const onMeasurementPressed = (item) => {
    props.setFormData(item);
    props.setNotebookPanelVisible(true);
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
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsOverview);

