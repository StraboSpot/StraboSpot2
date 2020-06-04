import React from 'react';
import {Text, View} from 'react-native';
import Slider from '@react-native-community/slider';
import styles from './ui.styles';
import * as themes from '../styles.constants';

const slider = (props) => {
  return (
    <React.Fragment>
      <View style={styles.sliderContainer}>
        <Slider
          value={props.value}
          onValueChange={props.onValueChange}
          onSlidingComplete={props.onSlidingComplete}
          maximumValue={props.maximumValue}
          minimumValue={props.minimumValue}
          style={styles.slider}
          step={props.step || 1}
          thumbStyle={{borderWidth: 1, borderColor: 'grey'}}
          minimumTrackTintColor={themes.PRIMARY_ACCENT_COLOR}
          maximumTrackTintColor={themes.PRIMARY_BACKGROUND_COLOR}
          thumbTintColor={props.thumbTintColor || themes.PRIMARY_BACKGROUND_COLOR}
        />
      </View>
      <View style={styles.sliderTextContainer}>
        <Text style={styles.sliderText}>{props.leftText}</Text>
        <Text style={styles.sliderText}>{props.rightText}</Text>
      </View>
    </React.Fragment>
  );
};

export default slider;
