import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Button, Divider, Icon} from "react-native-elements";
import {SpotPages} from "../notebook-panel/Notebook.constants";
import * as actionCreators from '../../store/actions';
// import {SET_SPOT_PAGE_VISIBLE} from "../../../store/Constants";

import ReturnToOverview from '../notebook-panel/ui/ReturnToOverviewButton';
import SectionDivider from "../../shared/ui/SectionDivider";

// Styles
import styles from './measurements.styles';
import * as themes from '../../themes/ColorThemes';

const MeasurementPage = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  const openMeasurementDetail = (item) => {
    console.log('item', item);
    props.setFormData(item);
    props.setPageVisible(SpotPages.MEASUREMENTDETAIL);
  };

  // Render an individual measurement
  const renderMeasurement = ({item}) => {
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
            {item.type === 'planar_orientation' && item.associated_orientation && 'Linear Feature   Planar Feature'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a measurement block in a list
  const renderItem = ({item}) => {
    return (
      <View style={styles.measurementsRenderListContainer}>
        {typeof (item) !== 'undefined' &&
        <View>
          {renderMeasurement({item})}
          {'associated_orientation' in item && item.associated_orientation.length > 0 &&
          <FlatList
            data={item.associated_orientation}
            renderItem={renderMeasurement}
            keyExtractor={(aoItem, aoIndex) => aoIndex.toString()}
          />}
          {/*<View style={styles.horizontalLine}/>*/}
        </View>}
        <View style={{flexDirection: 'row'}}>
        <Icon
          name='ios-information-circle-outline'
          containerStyle={{justifyContent: 'center', paddingRight: 10}}
          type='ionicon'
          color='blue'
          onPress={() => openMeasurementDetail(item)}
        />
        <Icon
          name='right'
          containerStyle={{justifyContent: 'center', paddingRight: 5}}
          type='antdesign'
          color= 'lightgrey'
          size={13}
        />
        </View>
      </View>
    );
  };

  const renderLinearMeasurements = () => {
    let data = props.spot.properties.orientations.filter(measurement => {
      return measurement.type === 'linear_orientation' && !measurement.associated_orientation
    });
    return (
      <View>
        {renderSectionDivider('Linear Measurements')}
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderPlanarMeasurements = () => {
    let data = props.spot.properties.orientations.filter(measurement => {
      return measurement.type === 'planar_orientation' && !measurement.associated_orientation
    });
    return (
      <View>
        {renderSectionDivider('Planar Measurements')}
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderPlanarLinearMeasurements = () => {
    let data = props.spot.properties.orientations.filter(measurement => {
      return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation') && measurement.associated_orientation
    });
    return (
      <View>
        {renderSectionDivider('Planar + Linear Measurements')}
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderSectionDivider = (dividerText) => {
    return (
      <View style={styles.measurementsSectionDividerContainer}>
        <SectionDivider dividerText={dividerText}/>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          <Button
            titleStyle={themes.BLUE}
            title={'Add'}
            type={'clear'}
            onPress={() => props.showModal('isCompassModalVisible', true)}
          />
        </View>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          <Button
            titleStyle={themes.BLUE}
            title={'Select'}
            type={'clear'}
          />
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      <View>
        <ReturnToOverview
          onPress={() => {
            const pageVisible = props.setPageVisible(SpotPages.OVERVIEW);
            if (pageVisible.page !== SpotPages.MEASUREMENT) {
              props.showModal('isCompassModalVisible', false);
            }
            // (pageVisible.page !== SpotPages.SAMPLE) props.showModal('isSamplesModalVisible', false);
          }}
        />
        <ScrollView>
          {props.spot.properties.orientations ? renderPlanarMeasurements() : null}
          {props.spot.properties.orientations ? renderLinearMeasurements(): null}
          {props.spot.properties.orientations ?renderPlanarLinearMeasurements(): null}
        </ScrollView>
      </View>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page)),
  setFormData: (formData) => (actionCreators.setFormData(formData))
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementPage);
