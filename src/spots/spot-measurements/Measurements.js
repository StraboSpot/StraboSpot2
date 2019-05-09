import React, {useState} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import Compass from '../../components/compass/Compass';
import styles from './MeasurementsStyles';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, Divider} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, FEATURE_ADD, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import spotPageStyles from '../spot-page/SpotPageStyles';

const MeasurementPage = (props) => {

  const [measurements, setMeasurements] = useState([]);

  const addMeasurement = (data) => {
    console.log('New measurement:', data);
    setMeasurements([...measurements, data]);
  };

  // Render an individual measurement block in a list
  const renderItem = ({item}) => {
    return (
      <View style={styles.measurementsListItem}>
        <View style={[styles.textBubble, styles.mainText]}>
          {item.strike && item.dip ?
            <Text onPress={() => console.log('item', item)}>
              {item.strike}/{item.dip}
            </Text> : null}
          {item.trend && item.plunge ?
            <Text onPress={() => console.log('item', item)}>
              {item.trend}/{item.plunge}
            </Text> : null}
        </View>
        <View style={[styles.textBubble, styles.propertyText]}>
          <Text>
            Some property of the measurement here.
          </Text>
        </View>
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
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(null, mapDispatchToProps)(MeasurementPage);
