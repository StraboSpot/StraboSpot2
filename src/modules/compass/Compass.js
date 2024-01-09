import React, {useEffect, useState} from 'react';
import {
  Animated,
  AppState,
  Easing,
  Image,
  NativeEventEmitter,
  NativeModules,
  Platform,
  Pressable,
  View,
} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import {setCompassMeasurements} from './compass.slice';
import compassStyles from './compass.styles';
import {isEmpty, roundToDecimalPlaces} from '../../shared/Helpers';
import DeviceSound from '../../utils/sounds/sound';
import {setModalVisible} from '../home/home.slice';
import useMeasurementsHook from '../measurements/useMeasurements';
import {MODAL_KEYS} from '../page/page.constants';

const Compass = ({
                   closeCompass,
                   setAttributeMeasurements,
                   setCompassRawDataToDisplay,
                   setMeasurements,
                   showCompassDataModal,
                   sliderValue,
                 }) => {
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const modalVisible = useSelector(state => state.home.modalVisible);

  const [compassData, setCompassData] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    heading: null,
    strike: null,
    dip_direction: null,
    dip: null,
    trend: null,
    plunge: null,
    rake: null,
    rake_calculated: 'yes',
    quality: null,
  });
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [buttonSound, setButtonSound] = useState(null);
  const [isManualMeasurement, setIsManualMeasurement] = useState(Platform.OS !== 'ios');

  const useMeasurements = useMeasurementsHook();

  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);

  useEffect(() => {
    console.log('UE Compass []');
    const buttonClick = new DeviceSound('compass_button_click.mp3', DeviceSound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Failed to load sound', error);
    });
    setButtonSound(buttonClick);
  }, []);

  useEffect(() => {
    console.log('UE Compass []');
    displayCompassData();
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      unsubscribe();
      AppState.addEventListener(
        'change',
        () => console.log('APP STATE EVENT REMOVED IN COMPASS')).remove();
    };
  }, []);

  // Create a new measurement on grabbing new compass measurements from shortcut modal
  useEffect(() => {
    console.log('UE Compass [compassMeasurements]', compassMeasurements);
    if (!isEmpty(compassMeasurements) && modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT) {
      console.log('New compass measurement recorded in Measurements.', compassMeasurements);
      useMeasurements.createNewMeasurement();
      dispatch(setCompassMeasurements({}));
    }
  }, [compassMeasurements]);

  const addAttributeMeasurement = (data) => {
    const sliderQuality = sliderValue ? {quality: sliderValue.toString()} : undefined;
    setAttributeMeasurements({...data, ...sliderQuality});
    closeCompass();
  };

  const displayCompassData = () => {
    if (Platform.OS === 'ios') {
      console.log('%cSUBSCRIBING to iOS  native compass data!', 'color: red');
      NativeModules.Compass.myDeviceRotation();
      CompassEvents.addListener('rotationMatrix', matrixRotation);
    }
  };

  const grabMeasurements = async (isCompassMeasurement) => {
    try {
      if (isCompassMeasurement) {
        if (buttonSound) {
          buttonSound.play((success) => {
            if (success) console.log('successfully finished playing compass sound');
            else console.log('compass sound failed due to audio decoding errors');
          });
        }
        const unixTimestamp = Date.now();
        const sliderQuality = !sliderValue || sliderValue === 6 ? {} : {quality: sliderValue.toString()};
        console.log('Compass measurements', compassData, sliderValue);
        if (setAttributeMeasurements) addAttributeMeasurement(compassData);
        else if (setMeasurements) {
          setMeasurements({...compassData, ...sliderQuality, unix_timestamp: unixTimestamp});
        }
        else {
          dispatch(setCompassMeasurements(compassData.quality ? compassData
            : {...compassData, ...sliderQuality}));
        }
      }
      else dispatch(setCompassMeasurements({...compassData, manual: true}));
    }
    catch (e) {
      console.log('Error grabbing compass measurement', e);
    }
  };

  const handleAppStateChange = (state) => {
    if (state === 'background' || state === 'inactive') {
      dispatch(setModalVisible({modal: null}));
      unsubscribe();
    }
  };

  const matrixRotation = (res) => {
    setCompassData({
      heading: res.heading,
      strike: res.strike,
      dip: res.dip,
      trend: res.trend,
      plunge: res.plunge,
      M11: roundToDecimalPlaces(res.M11, 3),
      M12: roundToDecimalPlaces(res.M12, 3),
      M13: roundToDecimalPlaces(res.M13, 3),
      M21: roundToDecimalPlaces(res.M21, 3),
      M22: roundToDecimalPlaces(res.M22, 3),
      M23: roundToDecimalPlaces(res.M23, 3),
      M31: roundToDecimalPlaces(res.M31, 3),
      M32: roundToDecimalPlaces(res.M32, 3),
      M33: roundToDecimalPlaces(res.M33, 3),
    });
  };

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearToggleOn = compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.LINEAR);
    const planerToggleOn = compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.PLANAR);

    if (linearToggleOn && planerToggleOn && compassData.trend !== null && compassData.strike !== null) {
      return [renderTrendSymbol(), renderStrikeDipSymbol()];
    }
    else if (linearToggleOn && compassData.trend !== null) return renderTrendSymbol();
    else if (planerToggleOn && compassData.strike !== null) return renderStrikeDipSymbol();
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let image = require('../../assets/images/compass/strike-dip-centered.png');
    const spin = strikeSpinValue.interpolate({
      inputRange: [0, compassData.strike],
      // inputRange: [0, 360], // Changed to get symbols to render while we figure out the android compass
      outputRange: ['0deg', compassData.strike + 'deg'],
      // outputRange: ['0deg', 180 + 'deg'], // Changed to get symbols to render while we figure out the android compass
    });
    // First set up animation
    Animated.timing(
      strikeSpinValue,
      {
        duration: 100,
        toValue: compassData.strike,
        easing: Easing.linear(),
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={[compassStyles.strikeAndDipLine, {transform: [{rotate: spin}]}]}/>
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderTrendSymbol = () => {
    let image = require('../../assets/images/compass/trendLine.png');
    const spin = trendSpinValue.interpolate({
      inputRange: [0, compassData.trend ? compassData.trend : 0],
      outputRange: ['0deg', compassData.trend + 'deg'],
    });
    // First set up animation
    Animated.timing(
      trendSpinValue,
      {
        duration: 100,
        toValue: compassData.trend,
        easing: Easing.linear,
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={[compassStyles.trendLine, {transform: [{rotate: spin}]}]}
      />
    );
  };

  const unsubscribe = () => {
    if (Platform.OS === 'ios') {
      NativeModules.Compass.stopObserving();
      CompassEvents.addListener('rotationMatrix', matrixRotation).remove();
      console.log('%cEnded Compass observation and rotationMatrix listener.', 'color: red');
    }
  };

  return (
    <View style={compassStyles.compassContainer}>
      <Pressable style={compassStyles.compassImageContainer} onPress={() => grabMeasurements(true)}>
        <Image source={require('../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
        {renderCompassSymbols()}
      </Pressable>
      {setCompassRawDataToDisplay && (
        <Button
          containerStyle={{position: 'absolute', bottom: 0, right: 0, width: 75}}
          titleStyle={{fontSize: 10}}
          title={'Display Compass Data'}
          type={'clear'}
          onPress={showCompassDataModal}
          compassData={setCompassRawDataToDisplay(compassData)}
        />
      )}
    </View>
  );
};

export default Compass;
