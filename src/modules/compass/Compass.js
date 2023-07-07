import React, {useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  AppState,
  Easing,
  Image,
  NativeEventEmitter,
  NativeModules,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';

import {Button} from 'react-native-elements';
import Sound from 'react-native-sound';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, roundToDecimalPlaces} from '../../shared/Helpers';
import {formStyles} from '../form';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import useMeasurementsHook from '../measurements/useMeasurements';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import {setCompassMeasurements} from './compass.slice';
import compassStyles from './compass.styles';
import ManualMeasurement from './ManualMeasurement';

const Compass = (props) => {
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const isTestingMode = useSelector(state => state.project.isTestingMode);
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
  // const [sliderValue, setSliderValue] = useState((props?.formValues?.quality
  //   && parseInt(props.formValues.quality)) || 6);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [buttonSound, setButtonSound] = useState(null);
  const [isManualMeasurement, setIsManualMeasurement] = useState(Platform.OS === 'android');

  const [useMeasurements] = useMeasurementsHook();

  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);

  useEffect(() => {
    console.log('UE Compass []');
    const buttonClick = new Sound('compass_button_click.mp3', Sound.MAIN_BUNDLE, (error) => {
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
    const sliderQuality = props.sliderValue ? {quality: props.sliderValue.toString()} : 'N/A';
    props.setAttributeMeasurements({...data, ...sliderQuality});
    props.closeCompass();
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
        buttonSound.play((success) => {
          if (success) console.log('successfully finished playing compass sound');
          else console.log('compass sound failed due to audio decoding errors');
        });
        const unixTimestamp = Date.now();
        const sliderQuality = !props.sliderValue || props.sliderValue === 6 ? {} : {quality: props.sliderValue.toString()};
        console.log('Compass measurements', compassData, props.sliderValue);
        if (props.setAttributeMeasurements) addAttributeMeasurement(compassData);
        else if (props.setMeasurements) {
          props.setMeasurements({...compassData, ...sliderQuality, unix_timestamp: unixTimestamp});
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
    if (res) {
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
    }
    else Alert.alert('Having trouble getting compass data from device!');
  };

  const renderCompass = () => {
    return (
      <View>
        <TouchableOpacity style={compassStyles.compassImageContainer} onPress={() => grabMeasurements(true)}>
          <Image source={require('../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
          {renderCompassSymbols()}
        </TouchableOpacity>
        {props.setCompassRawDataToDisplay && isTestingMode && (
          <Button
            containerStyle={{position: 'absolute', bottom: 0, right: 0, width: 75}}
            titleStyle={{fontSize: 10}}
            title={'Display Compass Data'}
            type={'clear'}
            onPress={props.showCompassDataModal}
            compassData={props.setCompassRawDataToDisplay(compassData)}
          />
        )}
      </View>
    );
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
    <React.Fragment>
      <View style={compassStyles.compassContainer}>
        {props.setAttributeMeasurements && Platform.OS !== 'android' && (
          <Button
            buttonStyle={formStyles.formButtonSmall}
            titleProps={formStyles.formButtonTitle}
            title={isManualMeasurement ? 'Switch to Compass Input' : 'Switch to Manual Input'}
            type={'clear'}
            onPress={() => setIsManualMeasurement(!isManualMeasurement)}
          />
        )}
        {props.setAttributeMeasurements && isManualMeasurement ? (
            <ManualMeasurement
              addAttributeMeasurement={addAttributeMeasurement}
              setAttributeMeasurements={props.setAttributeMeasurements}
              measurementTypes={compassMeasurementTypes}
            />
          )
          : renderCompass()
        }
      </View>
      {/*<View style={compassStyles.sliderContainer}>*/}
      {/*  <Text style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>Quality of Measurement</Text>*/}
      {/*  <Slider*/}
      {/*    onSlidingComplete={value => setSliderValue(value)}*/}
      {/*    value={sliderValue}*/}
      {/*    step={1}*/}
      {/*    maximumValue={6}*/}
      {/*    minimumValue={1}*/}
      {/*    labels={['Low', '', '', '', 'High', 'N/R']}*/}
      {/*    labelStyle={uiStyles.sliderLabel}*/}
      {/*  />*/}
      {/*</View>*/}
    </React.Fragment>
  );
};

export default Compass;
