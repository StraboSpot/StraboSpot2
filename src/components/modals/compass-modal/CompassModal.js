import React from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import Aux from '../../../shared/AuxWrapper';
import Modal from "react-native-modal";
import styles from "../../notebook-panel/notebook-measurements/MeasurementsStyles";
import Compass from '../../../components/compass/Compass';
import Slider from '../../../ui/Slider';


const CompassModal = (props) => {

  return (
    <View style={{ height: 400, width: '100%'}}>
      <View style={styles.modalTop}>
        <View style={styles.navButtonsContainer}>
          <View style={styles.rightContainer}>
            <Button
              titleStyle={{color: 'blue', fontSize: 14}}
              title={'Close'}
              type={'clear'}
              onPress={props.close}
            />
          </View>
          {/*<View style={styles.rightContainer}>*/}
          {/*  <Button*/}
          {/*    titleStyle={{color: 'blue', fontSize: 14}}*/}
          {/*    title={'Save'}*/}
          {/*    type={'clear'}*/}
          {/*    onPress={() => props.setPageVisible(SpotPages.MEASUREMENT)}*/}
          {/*  />*/}
          {/*</View>*/}
        </View>
        <View >
          <Text style={{fontSize: 12, paddingLeft: 10}}>Tap Compass to record a measurement</Text>
        </View>
      </View>
      <View style={styles.compassContainer}>
        <Compass/>
      </View>
      <View style={styles.modalBottom}>
        <Slider style={styles.slider}/>
      </View>
    </View>
  );
};

export default CompassModal;
