import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Button, Divider} from "react-native-elements";
import {SpotPages} from "../Notebook.constants";
import * as actionCreators from '../../../store/actions/index';
// import {SET_SPOT_PAGE_VISIBLE} from "../../../store/Constants";
import styles from './MeasurementsStyles';
import spotPageStyles from '../SpotPageStyles';
import ReturnToOverview from '../ui/ReturnToOverviewButton';

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
      <TouchableOpacity style={styles.measurementsListItem}
                        onPress={() => openMeasurementDetail(item)}>
        <View style={[styles.textBubble, styles.mainText]}>
          {'strike' in item && 'dip' in item ?
            <Text>
              {item.strike}/{item.dip}
            </Text> : null}
          {'trend' in item && 'plunge' in item ?
            <Text>
              {item.trend}/{item.plunge}
            </Text> : null}
        </View>
        <View style={[styles.textBubble, styles.propertyText]}>
          <Text>
            {item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a measurement block in a list
  const renderItem = ({item}) => {
    return (
      <View style={{backgroundColor: 'white', paddingTop: 20}}>
        {typeof (item) !== 'undefined' &&
        <View >
          {renderMeasurement({item})}
          {'associated_orientation' in item && item.associated_orientation.length > 0 &&
          <FlatList
            data={item.associated_orientation}
            renderItem={renderMeasurement}
            keyExtractor={(aoItem, aoIndex) => aoIndex.toString()}
          /> }
          {/*<View style={styles.horizontalLine}/>*/}
        </View>}
      </View>
    );
  };

   return (
    <React.Fragment>
      <ReturnToOverview
        onPress={() => {
          const pageVisible = props.setPageVisible(SpotPages.OVERVIEW);
          if (pageVisible.page !== SpotPages.MEASUREMENT ) {
            props.showModal('isCompassModalVisible', false);
          }
           // (pageVisible.page !== SpotPages.SAMPLE) props.showModal('isSamplesModalVisible', false);
        }}
      />
      <Button
        containerStyle={styles.backButton}
        titleStyle={{color: 'blue'}}
        title={'Open Compass'}
        type={'clear'}
        onPress={() => props.showModal('isCompassModalVisible', true)}
      />
      <ScrollView>
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Measurements</Text>
        </Divider>
        <FlatList
          data={props.spot.properties.orientations}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page)),
  setFormData: (formData) => (actionCreators.setFormData(formData))
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementPage);
