import React from 'react';
import {Text, View} from 'react-native';

import Slider from '@react-native-community/slider';

import * as themes from '../styles.constants';
import styles from './ui.styles';

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
          minimumTrackTintColor={themes.MEDIUMGREY}
          maximumTrackTintColor={themes.MEDIUMGREY}
          thumbTintColor={props.thumbTintColor || themes.DARKGREY}
        />
      </View>
      {!props.isHideLabels && (
        <View style={props.rotateLabels ? {...styles.sliderTextContainer, paddingTop: 10, paddingBottom: 10}
          : {...styles.sliderTextContainer}}>
          {props.labels.map(label => {
            return (
              <Text style={props.rotateLabels && {transform: [{rotate: '290deg'}], marginLeft: -12}}>
                {label}
              </Text>
            );
          })}
        </View>
      )}
    </React.Fragment>
  );
};

export default slider;
