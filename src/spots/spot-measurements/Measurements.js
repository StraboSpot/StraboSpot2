import React from 'react';
import {FlatList, ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import Compass from '../../components/compass/Compass';
import styles from './MeasurementsStyles';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, Divider} from "react-native-elements";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import spotPageStyles from '../spot-page/SpotPageStyles';

const MeasurementPage = (props) => {

  const openMeasurementDetail = (item) => {
    console.log('item', item);
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
       {/*TODO: Make back button into UI component */}
      <Button
        icon={{
          name: 'arrow-back',
          size: 20,
          color: 'black'
        }}
        containerStyle={{marginTop: 10, alignItems: 'flex-start'}}
        titleStyle={{color: 'blue'}}
        title={'Return to Overview'}
        type={'clear'}
        onPress={() => props.setPageVisible(SpotPages.OVERVIEW)}
      />
      <ScrollView>
        <View style={styles.compassContainer}>
          <Compass/>
        </View>
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDivider}>Measurements</Text>
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
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementPage);
