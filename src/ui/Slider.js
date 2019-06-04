import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Slider} from 'react-native-elements';


const slider = (props) => {

  const [sliderValue, setSliderValue] = useState(0)

  return (
    <React.Fragment>
      <Text>Value: {sliderValue}</Text>
      <Slider
        value={sliderValue}
        onValueChange={value => setSliderValue(value)}
        maximumValue={5}
        style={props.style}
        step={1}
        thumbStyle
      />
    </React.Fragment>
  );
};

export default slider;
