import React from 'react';
import {Text, View} from 'react-native';

import Slider from '@react-native-community/slider';

import * as themes from '../styles.constants';
import styles from './ui.styles';

const SliderBar = (props) => {
  console.log('Rendering Slider...');
  console.log('Slider props:', props);

  return (
    <React.Fragment>
      <View style={styles.sliderContainer}>
        <Slider
          value={props.value}
          onValueChange={props.onValueChange}
          onSlidingComplete={props.onSlidingComplete}
          minimumValue={props.minimumValue}
          maximumValue={props.maximumValue}
          style={styles.slider}
          step={props.step || 1}
          minimumTrackTintColor={themes.MEDIUMGREY}
          maximumTrackTintColor={themes.MEDIUMGREY}
          thumbTintColor={props.thumbTintColor || themes.DARKGREY}
          // thumbImage={require('../../assets/images/noimage.jpg')}
        />
      </View>
      {!props.isHideLabels && (
        <View style={props.rotateLabels ? {...styles.sliderTextContainer, paddingTop: 10, paddingBottom: 10}
          : {...styles.sliderTextContainer}}>
          {props.labels.map((label) => {
            return (
              <Text
                style={[props.rotateLabels && {transform: [{rotate: '290deg'}], marginLeft: -12}, props.labelStyle]}>
                {label}
              </Text>
            );
          })}
        </View>
      )}
    </React.Fragment>
  );
};

export default SliderBar;
