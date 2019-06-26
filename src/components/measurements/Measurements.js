import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Button} from "react-native-elements";
import {notebookReducers, SpotPages} from "../notebook-panel/Notebook.constants";
import ReturnToOverview from '../notebook-panel/ui/ReturnToOverviewButton';
import SectionDivider from "../../shared/ui/SectionDivider";
import MeasurementItem from './MeasurementItem';

// Styles
import styles from './measurements.styles';
import * as themes from '../../themes/ColorThemes';

const MeasurementsPage = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  const renderLinearMeasurements = () => {
    let data = props.spot.properties.orientations.filter(measurement => {
      return measurement.type === 'linear_orientation' && !measurement.associated_orientation
    });
    return (
      <View>
        <FlatList
          data={data}
          renderItem={item => <MeasurementItem item={item}/>}
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
        <FlatList
          data={data}
          renderItem={item => <MeasurementItem item={item}/>}
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
        <FlatList
          data={data}
          renderItem={item => <MeasurementItem item={item}/>}
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
          {renderSectionDivider('Planar Measurements')}
          {props.spot.properties.orientations && renderPlanarMeasurements()}
          {renderSectionDivider('Linear Measurements')}
          {props.spot.properties.orientations && renderLinearMeasurements()}
          {renderSectionDivider('Planar + Linear Measurements')}
          {props.spot.properties.orientations && renderPlanarLinearMeasurements()}
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
  setPageVisible: (page) => ({type: notebookReducers.SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsPage);
