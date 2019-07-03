import React from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {notebookReducers, NotebookPages} from "../notebook-panel/Notebook.constants";
import {formReducers} from "../form/Form.constant";

// Styles
import styles from "./measurements.styles";
import stylesCommon from "../../shared/common.styles";
import * as themes from '../../shared/styles.constants';

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const openMeasurementDetail = (item) => {
    console.log('item', item);
    props.setFormData(item);
    props.setNotebookPanelVisible(true);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };
// Render an individual measurement
  const renderMeasurementText = (item) => {
    return (
      <View
        style={styles.measurementsListItem}
      >
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
      </View>
    );
  };

  return (
    <View style={styles.measurementsRenderListContainer}>
      {typeof (props.item.item) !== 'undefined' &&
      <TouchableOpacity
        style={stylesCommon.rowContainer}
        onPress={() => openMeasurementDetail(props.item.item)}>
        <View style={stylesCommon.row}>
          <View style={stylesCommon.fillWidthSide}>
            {renderMeasurementText(props.item.item)}
          </View>
          <View style={stylesCommon.itemRightIconsContainer}>
            <Icon
              name='ios-information-circle-outline'
              containerStyle={{justifyContent: 'center', paddingRight: 10}}
              type='ionicon'
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => openMeasurementDetail(props.item)}
            />
            <Icon
              name='right'
              containerStyle={{justifyContent: 'center', paddingRight: 10}}
              type='antdesign'
              color={themes.PRIMARY_BACKGROUND_COLOR}
              size={13}
            />
          </View>
        </View>
      </TouchableOpacity>
      }
    </View>
  );
};

function mapStateToProps(state) {
  return {}
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementItem);
