import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import Compass from '../../components/compass/Compass';
import styles from './MeasurementsStyles';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, Divider} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, FEATURE_ADD, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import spotPageStyles from '../spot-page/SpotPageStyles';

const MeasurementPage = (props) => {
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
      {/*<Text>This is the measurements page</Text>*/}
      <View style={styles.compassContainer}>
        <Compass/>
      </View>
      <Divider style={spotPageStyles.divider}>
        <Text style={spotPageStyles.spotDivider}>Measurements</Text>
      </Divider>
      <View>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
        <Text>This is the measurements page</Text>
      </View>
      </ScrollView>
    </React.Fragment>
  );
};

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page })
};

export default connect(null, mapDispatchToProps)(MeasurementPage);
