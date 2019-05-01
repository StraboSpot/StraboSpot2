import React from 'react';
import {Text, View} from 'react-native';
import {connect} from 'react-redux';
import Compass from '../../components/compass/Compass';
import styles from './MeasurementsStyles';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, FEATURE_ADD, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";

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
      {/*<Text>This is the measurements page</Text>*/}
      <View style={styles.compassContainer}>
        <Compass/>
      </View>
    </React.Fragment>
  );
};

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page })
};

export default connect(null, mapDispatchToProps)(MeasurementPage);
