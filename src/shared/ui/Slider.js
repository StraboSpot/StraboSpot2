import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Slider} from 'react-native-elements/src/index';
import styles from './ui.styles';
import * as themes from '../styles.constants';


const slider = (props) => {

  return (
    <React.Fragment>
      {/*<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'*/}
      {/*}}>*/}

        <View style={styles.sliderContainer} >
          <Slider
            value={props.sliderValue}
            onValueChange={value => props.setSliderValue(value)}
            maximumValue={5}
            minimumValue={1}
            style={styles.slider}
            step={1}
            thumbStyle={{borderWidth: 1, borderColor: 'grey'}}
            minimumTrackTintColor={themes.BLUE}
            maximumTrackTintColor={themes.LIGHTGREY}
            thumbTintColor={themes.LIGHTGREY}
          />
        </View>

        <View style={styles.sliderTextContainer}>
          {/*<View style={styles.sliderTextContainer}>*/}
            <Text style={styles.sliderText}>{props.leftText}</Text>
          {/*</View>*/}
          {/*<View style={styles.sliderTextContainer} >*/}
            <Text style={styles.sliderText}>{props.rightText}</Text>
          {/*</View>*/}
        </View>
      {/*</View>*/}
    </React.Fragment>
  );
};

export default slider;
