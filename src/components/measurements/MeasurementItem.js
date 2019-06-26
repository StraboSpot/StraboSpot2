import React from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {notebookReducers, NotebookPages} from "../notebook-panel/Notebook.constants";
import {formReducers} from "../form/Form.constant";

// Styles
import styles from "./measurements.styles";

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const openMeasurementDetail = (item) => {
    console.log('item', item);
    props.setFormData(item);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };

// Render an individual measurement
  const renderMeasurementText = (item) => {
    return (
      <TouchableOpacity
        style={styles.measurementsListItem}
        onPress={() => openMeasurementDetail(item)}>
        <View>
          {'strike' in item && 'dip' in item &&
          <Text style={styles.mainText}>
            {item.strike}/{item.dip}
          </Text>}
          {'trend' in item && 'plunge' in item &&
          <Text style={styles.mainText}>
            {item.trend}/{item.plunge}
          </Text>}
        </View>
        <View>
          <Text style={styles.propertyText}>
            {item.type === 'linear_orientation' && !item.associated_orientation && 'Linear Feature'}
            {item.type === 'planar_orientation' && !item.associated_orientation && 'Planar Feature'}
            {item.type === 'planar_orientation' && item.associated_orientation && 'Planar Feature   Linear Feature'}
            {item.type === 'linear_orientation' && item.associated_orientation && 'Linear Feature   Planar Feature'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.measurementsRenderListContainer}>
      {typeof (props.item.item) !== 'undefined' &&
      <View>
        {renderMeasurementText(props.item.item)}
        {/*          {'associated_orientation' in item && item.associated_orientation.length > 0 &&
          <FlatList
            data={item.associated_orientation}
            MeasurementItem={renderMeasurement}
            keyExtractor={(aoItem, aoIndex) => aoIndex.toString()}
          />}*/}
      </View>}
      <View style={{flexDirection: 'row'}}>
        <Icon
          name='ios-information-circle-outline'
          containerStyle={{justifyContent: 'center', paddingRight: 10}}
          type='ionicon'
          color='blue'
          onPress={() => openMeasurementDetail(props.item)}
        />
        <Icon
          name='right'
          containerStyle={{justifyContent: 'center', paddingRight: 5}}
          type='antdesign'
          color='lightgrey'
          size={13}
        />
      </View>
    </View>
  );
};

function mapStateToProps(state) {
  return {}
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData})
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementItem);
