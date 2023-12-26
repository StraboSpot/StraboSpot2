import React from 'react';
import {Text, View} from 'react-native';

import Slider from '@react-native-community/slider';

import uiStyles from './ui.styles';
import * as themes from '../styles.constants';

const SliderBar = ({
                     isHideLabels,
                     labels,
                     maximumValue,
                     minimumValue,
                     onSlidingComplete,
                     onValueChange,
                     rotateLabels,
                     step,
                     thumbTintColor,
                     value,
                   }) => {
  return (
    <>
      <Slider
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        style={uiStyles.slider}
        step={step || 1}
        minimumTrackTintColor={themes.MEDIUMGREY}
        maximumTrackTintColor={themes.MEDIUMGREY}
        thumbTintColor={thumbTintColor || themes.DARKGREY}
      />
      {!isHideLabels && (
        <View style={[uiStyles.sliderTextContainer, rotateLabels && {paddingTop: 10, paddingBottom: 10}]}>
          {labels?.map((label, index) => {
            return (
              <Text
                key={label + index}
                style={[uiStyles.sliderLabel, rotateLabels && {transform: [{rotate: '290deg'}], marginLeft: -12}]}
              >
                {label}
              </Text>
            );
          })}
        </View>
      )}
    </>
  );
};

export default SliderBar;
