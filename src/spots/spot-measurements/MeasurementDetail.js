import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button} from "react-native-elements";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import styles from './MeasurementsStyles';

const MeasurementDetailPage = (props) => {

  return (
    <React.Fragment>

      <View style={styles.measurementDetailContainer}>
        <View style={styles.navButtonsContainer}>
          <View style={styles.leftContainer}>
            <Button
              titleStyle={{color: 'blue'}}
              title={'Cancel'}
              type={'clear'}
              onPress={() => props.setPageVisible(SpotPages.MEASUREMENT)}
            />
          </View>
          <View style={styles.rightContainer}>
            <Button
              titleStyle={{color: 'blue'}}
              title={'Save'}
              type={'clear'}
              onPress={() => props.setPageVisible(SpotPages.MEASUREMENT)}
            />
          </View>
        </View>
        <View style={styles.measurementDetailSwitches}>
          <Text>Feature type switches go here</Text>
        </View>
        <ScrollView style={{backgroundColor: 'steelblue'}}>
          <Text>Form goes here</Text>
        </ScrollView>
      </View>

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

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
