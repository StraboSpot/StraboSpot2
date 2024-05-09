import React, {useState} from 'react';
import {Animated, Easing, ImageBackground, Pressable, View} from 'react-native';

import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import compassStyles from './compass.styles';

const CompassFace = ({compassMeasurementTypes, compassData, grabMeasurements, selectedIndex}) => {

  const strikeAndDipStyles = [compassStyles.strikeAndDipLine];
  const trendAndPlungeStyles = [compassStyles.trendLine];

  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearToggleOn = compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.LINEAR);
    const planerToggleOn = compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.PLANAR);

    if (linearToggleOn && planerToggleOn && compassData.trend !== null && compassData.strike !== null) {
      strikeAndDipStyles.push({position: 'absolute'});
      return [renderTrendSymbol(), renderStrikeDipSymbol()];
    }
    else if (linearToggleOn) return renderTrendSymbol();
    if (planerToggleOn) return renderStrikeDipSymbol();
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let spin;
    const strikeAdjusted = selectedIndex === 0 ? compassData.strike : compassData?.magStrike;
    let image = require('../../assets/images/compass/strike-dip-centered.png');
    if (compassData.strike >= 0) {
      spin = strikeSpinValue.interpolate({
        inputRange: [0, strikeAdjusted],
        // inputRange: [0, 360], // Changed to get symbols to render while we figure out the android compass
        outputRange: ['0deg', strikeAdjusted + 'deg'],
        // outputRange: ['0deg', 180 + 'deg'], // Changed to get symbols to render while we figure out the android compass
      });

      strikeAndDipStyles.push({transform: [{rotate: spin}]});
      // First set up animation

      Animated.timing(
        strikeSpinValue,
        {
          duration: 100,
          toValue: strikeAdjusted,
          easing: Easing.linear(),
          useNativeDriver: true,
        },
      ).start();

      return (
        <Animated.Image
          key={image}
          source={image}
          style={strikeAndDipStyles}/>
      );
    }
  };

  // Render the strike and dip symbol inside the compass
  const renderTrendSymbol = () => {
    const trendAdjusted = selectedIndex === 0 ? compassData.trend : compassData?.magTrend;
    let image = require('../../assets/images/compass/trendLine.png');
    const spin = trendSpinValue.interpolate({
      inputRange: [0, trendAdjusted],
      outputRange: ['0deg', trendAdjusted + 'deg'],
    });

    trendAndPlungeStyles.push({transform: [{rotate: spin}]});
    // First set up animation
    Animated.timing(
      trendSpinValue,
      {
        duration: 100,
        toValue: trendAdjusted,
        easing: Easing.linear,
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={trendAndPlungeStyles}
      />
    );
  };

  return (
    <View style={compassStyles.compassImageContainer}>
      <Pressable onPress={() => grabMeasurements(true)}>
        <ImageBackground source={require('../../assets/images/compass/compass.png')} style={compassStyles.compassImage}>
          {renderCompassSymbols()}
        </ImageBackground>
      </Pressable>

    </View>
  );
};

export default CompassFace;
