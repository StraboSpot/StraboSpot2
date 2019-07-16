import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Button} from "react-native-elements";
import {notebookReducers, NotebookPages} from "../notebook-panel/Notebook.constants";
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import SectionDivider from "../../shared/ui/SectionDivider";
import MeasurementItem from './MeasurementItem';
import {homeReducers, Modals} from "../../views/home/Home.constants";

// Styles
import styles from './measurements.styles';
import * as themes from '../../shared/styles.constants';

const MeasurementsPage = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  const renderLinearMeasurements = () => {
    let data = props.spot.properties.orientation_data.filter(measurement => {
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
    let data = props.spot.properties.orientation_data.filter(measurement => {
      return (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation') && !measurement.associated_orientation
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
    let data = props.spot.properties.orientation_data.filter(measurement => {
      return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation' || measurement.type === 'tabular_orientation') && measurement.associated_orientation
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
            titleStyle={themes.PRIMARY_ACCENT_COLOR}
            title={'Add'}
            type={'clear'}
            onPress={() => props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)}
          />
        </View>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          <Button
            titleStyle={themes.PRIMARY_ACCENT_COLOR}
            title={'Select'}
            type={'clear'}
          />
        </View>
      </View>
    );
  };

  const renderSectionDividerShortcutView = (dividerText) => {
    return (
      <View style={styles.measurementsSectionDividerShortcutContainer}>
        <SectionDivider dividerText={dividerText}/>
      </View>
    )
  };

  const renderMeasurementsNotebookView = () => {
    return (
      <View style={styles.measurementsContentContainer}>
        <ReturnToOverviewButton
          onPress={() => {
            props.setNotebookPageVisible(NotebookPages.OVERVIEW);
            props.setModalVisible(null);
          }}
        />
        <ScrollView>
          {renderSectionDivider('Planar Measurements')}
          {props.spot.properties.orientation_data && renderPlanarMeasurements()}
          {renderSectionDivider('Linear Measurements')}
          {props.spot.properties.orientation_data && renderLinearMeasurements()}
          {renderSectionDivider('Planar + Linear Measurements')}
          {props.spot.properties.orientation_data && renderPlanarLinearMeasurements()}
        </ScrollView>
      </View>
    )
  };

  const renderMeasurementsShortcutView = () => {
    return (
      <View>
        <ScrollView>
          {renderSectionDividerShortcutView('Planar')}
          {props.spot.properties.orientation_data && renderPlanarMeasurements()}
          {renderSectionDividerShortcutView('Linear')}
          {props.spot.properties.orientation_data && renderLinearMeasurements()}
          {renderSectionDividerShortcutView('Planar + Linear')}
          {props.spot.properties.orientation_data && renderPlanarLinearMeasurements()}
        </ScrollView>
      </View>
    )
  };

  return (
    <React.Fragment>
      {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? renderMeasurementsShortcutView() : renderMeasurementsNotebookView()}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible
  }
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsPage);
