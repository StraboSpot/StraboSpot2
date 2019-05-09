import React, {useState} from 'react';
import {Alert, FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import Compass from '../../components/compass/Compass';
import styles from './MeasurementsStyles';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, Divider} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, FEATURE_ADD, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import spotPageStyles from '../spot-page/SpotPageStyles';

const MeasurementPage = (props) => {

  const [measurements, setMeasurements] = useState(props.spot.properties.orientations);

  const addMeasurement = (data) => {
    if (data.length > 0) {
      console.log('New measurement:', data);
      let newOrientation = data[0];
      if (data.length > 1) newOrientation.associated_orientation = [data[1]];
      const orientations = (typeof measurements === 'undefined') ? [newOrientation] : [...measurements, newOrientation];
      setMeasurements(orientations);
      props.onSpotEdit('orientations', orientations);
    }
    else Alert.alert('No Measurement Type', 'Pleas select a measurement type using the toggles.')
  };

  const openMeasurementDetail = () => {

  };
  // Render an individual measurement
  const renderMeasurement = ({item}) => {
    return (
      <View style={styles.measurementsListItem}>
        <View style={[styles.textBubble, styles.mainText]}>
          {'strike' in item && 'dip' in item ?
            <Text onPress={() => console.log('item', item)}>
              {item.strike}/{item.dip}
            </Text> : null}
          {'trend' in item && 'plunge' in item ?
            <Text onPress={() => console.log('item', item)}>
              {item.trend}/{item.plunge}
            </Text> : null}
        </View>
        <View style={[styles.textBubble, styles.propertyText]}>
          <Text>
            {item.type}
          </Text>
        </View>
      </View>
    );
  };

  // Render a measurement block in a list
  const renderItem = ({item}) => {
    return (
      <View>
        {typeof (item) !== 'undefined' ?
          <View>
            {renderMeasurement({item})}
            {'associated_orientation' in item && item.associated_orientation.length > 0 ?
              <FlatList
                data={item.associated_orientation}
                renderItem={renderMeasurement}
                keyExtractor={(aoItem, aoIndex) => aoIndex.toString()}
              /> : null}
            <View style={styles.horizontalLine}/>
          </View> : null}
      </View>
    );
  };

  return (
    <React.Fragment>
      <Button
        icon={{
          name: 'arrow-back',
          size: 20,
          color: 'black'
        }}
        containerStyle={{marginTop: 10}}
        titleStyle={{color: 'blue'}}
        title={'Return to Overview'}
        type={'clear'}
        onPress={() => props.setPageVisible(SpotPages.OVERVIEW)}
      />
      <ScrollView>
        <View style={styles.compassContainer}>
          <Compass
            addMeasurement={addMeasurement}/>
        </View>
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDivider}>Measurements</Text>
        </Divider>
        <FlatList
          data={measurements}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </React.Fragment>
  );
};

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page}),
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(null, mapDispatchToProps)(MeasurementPage);
