import React from 'react';
import {Text, View} from 'react-native';
import {Slider} from 'react-native-elements';
import styles from './ui.styles';
import * as themes from '../styles.constants';

const slider = (props) => {
  return (
    <React.Fragment>
      {/*<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'*/}
      {/*}}>*/}

      <View style={styles.sliderContainer}>
        <Slider
          value={props.sliderValue}
          onValueChange={props.onValueChange}
          onSlidingComplete={props.onSlidingComplete}
          maximumValue={props.maxValue}
          minimumValue={props.minValue}
          style={styles.slider}
          step={props.step || 1}
          thumbStyle={{borderWidth: 1, borderColor: 'grey'}}
          minimumTrackTintColor={themes.PRIMARY_ACCENT_COLOR}
          maximumTrackTintColor={themes.PRIMARY_BACKGROUND_COLOR}
          thumbTintColor={themes.PRIMARY_BACKGROUND_COLOR}
        />
      </View>
      {props.children}
      {/*<View style={styles.sliderTextContainer}>*/}
      {/*  /!*<View style={home.sliderTextContainer}>*!/*/}
      {/*  <Text style={styles.sliderText}>{props.leftText}</Text>*/}
      {/*  /!*</View>*!/*/}
      {/*  /!*<View style={home.sliderTextContainer} >*!/*/}
      {/*  <Text style={styles.sliderText}>{props.rightText}</Text>*/}
      {/*  /!*</View>*!/*/}
      {/*</View>*/}
      {/*</View>*/}
    </React.Fragment>
  );
};

export default slider;
