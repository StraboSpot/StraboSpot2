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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {accelerometer, SensorTypes, setUpdateIntervalForType} from 'react-native-sensors';
import Sound from 'react-native-sound';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, mod, roundToDecimalPlaces, toDegrees, toRadians} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import modalStyle from '../../shared/ui/modal/modal.style';
import Slider from '../../shared/ui/Slider';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import useMapsHook from '../maps/useMaps';
import useMeasurementsHook from '../measurements/useMeasurements';
import {setUseMeasurementTemplates} from '../project/projects.slice';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import {setCompassMeasurements, setCompassMeasurementTypes} from './compass.slice';
import compassStyles from './compass.styles';

const Compass = () => {
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedMeasurement = useSelector(state => state.spot.selectedMeasurement);
  const useMeasurementTemplates = useSelector(state => state.project.project?.templates?.useMeasurementTemplates);
  const activeMeasurementTemplates = useSelector(
    state => state.project.project?.templates?.activeMeasurementTemplates) || [];

  const [accelerometerData, setAccelerometerData] = useState({x: 0, y: 0, z: 0, timestamp: null});
  const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
  const [compassData, setCompassData] = useState({
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
  const [magnetometer, setMagnetometer] = useState(0);
  // const [showData, setShowData] = useState(false);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [toggles, setToggles] = useState(compassMeasurementTypes);
  const [buttonSound, setButtonSound] = useState(null);

  const [useMaps] = useMapsHook();
  const [useMeasurements] = useMeasurementsHook();

  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);

  useEffect(() => {
    const buttonClick = new Sound('button_click.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Failed to load sound', error);
    });
    setButtonSound(buttonClick);
  }, []);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    if (Platform.OS === 'android') {
      setUpdateIntervalForType(SensorTypes.accelerometer, 300);
      setUpdateIntervalForType(SensorTypes.magnetometer, 300);
      subscribeToAccelerometer().catch(e => console.log('Error with Accelerometer', e));
    }
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      unsubscribe();
    };
  }, []);

  // Update compass data on accelerometer data changed
  useEffect(() => {
    displayCompassData();
  }, [accelerometerData]);

  // Create a new measurement on grabbing new compass measurements from shortcut modal
  useEffect(() => {
    if (!isEmpty(compassMeasurements) && modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      console.log('New compass measurement recorded in Measurements.', compassMeasurements);
      useMeasurements.createNewMeasurement();
      dispatch(setCompassMeasurements({}));
    }
  }, [compassMeasurements]);

  // Update quality slider on active measurement changed
  useEffect(() => {
    if (!isEmpty(selectedMeasurement) && selectedMeasurement.quality) {
      setSliderValue(parseInt(selectedMeasurement.quality, 10));
    }
  }, [selectedMeasurement]);

  // Update compass on measurement type changed
  useEffect(() => {
    console.log('compassMeasurementTypes', compassMeasurementTypes);
    setToggles(compassMeasurementTypes);
  }, [compassMeasurementTypes]);

  const calculateOrientation = () => {
    const x = accelerometerData.x;
    const y = accelerometerData.y;
    const z = accelerometerData.z;
    let actualHeading = mod(magnetometer - 270, 360);  // ToDo: adjust for declination

    // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
    // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
    // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
    // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
    // keyboard, and is positive as it moves up.
    // All results in this section are in radians
    let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let B = s === 0 ? 0 : Math.acos(Math.abs(y) / s);
    let R = toRadians(90 - toDegrees(B));
    let d = g === 0 ? 0 : Math.acos(Math.abs(z) / g);
    let b = Math.atan(Math.tan(R) * Math.cos(d));

    // Calculate dip direction, strike and dip (in degrees)
    let dipdir, strike, dip;
    let diry = actualHeading;
    if (x === 0 && y === 0) {
      d = 0;
      dipdir = 180;
    }
    else if (x >= 0 && y >= 0) dipdir = diry - 90 - toDegrees(b);
    else if (y <= 0 && x >= 0) dipdir = diry - 90 + toDegrees(b);
    else if (y <= 0 && x <= 0) dipdir = diry + 90 - toDegrees(b);
    else if (x <= 0 && y >= 0) dipdir = diry + 90 + toDegrees(b);

    if (z > 0) dipdir = mod(dipdir, 360);
    else if (z < 0) dipdir = mod(dipdir - 180, 360);

    strike = mod(dipdir + 180, 360);
    dip = toDegrees(d);

    // Calculate trend, plunge and rake (in degrees)
    let trend, plunge, rake;
    if (y > 0) trend = mod(diry, 360);
    else if (y <= 0) trend = mod(diry + 180, 360);
    if (z > 0) trend = mod(trend - 180, 360);
    plunge = g === 0 ? 0 : toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    setCompassData({
      heading: roundToDecimalPlaces(actualHeading, 4),
      strike: roundToDecimalPlaces(strike, 0),
      dip_direction: roundToDecimalPlaces(dipdir, 0),
      dip: roundToDecimalPlaces(dip, 0),
      trend: roundToDecimalPlaces(trend, 0),
      plunge: roundToDecimalPlaces(plunge, 0),
      rake: roundToDecimalPlaces(rake, 0),
      rake_calculated: 'yes',
      quality: sliderValue.toString(),
    });
  };

  const displayCompassData = () => {
    if (Platform.OS === 'ios') {
      console.log('%cSUBSCRIBING to native compass data', 'color: red');
      NativeModules.Compass.myDeviceRotation();
      CompassEvents.addListener('rotationMatrix', matrixRotation);
    }
    else calculateOrientation();
  };

  const grabMeasurements = async (isCompassMeasurement) => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) await useMaps.setPointAtCurrentLocation();
    try {
      if (isCompassMeasurement) {
        buttonSound.play();
        console.log('Compass measurements', compassData, sliderValue);
        dispatch(setCompassMeasurements(compassData.quality ? compassData
          : {...compassData, quality: sliderValue.toString()}));
      }
      else dispatch(setCompassMeasurements({...compassData, manual: true}));
    }
    catch (e) {
      console.log('Compass click sound playback failed due to audio decoding errors', e);
    }
  };

  const handleAppStateChange = (state) => {
    if (state === 'active') Platform.OS === 'ios' ? displayCompassData() : subscribeToAccelerometer();
    else if (state === 'background' || state === 'inactive') {
      dispatch(setModalVisible({modal: null}));
      unsubscribe();
    }
    ;
  };

  const matrixRotation = res => {
    if (res) {
      setCompassData({
        heading: res.heading,
        strike: res.strike,
        dip: res.dip,
        trend: res.trend,
        plunge: res.plunge,
      });
    }
    else Alert.alert('Having trouble getting compass data from device!');
  };

  const renderCompass = () => {
    return (
      <TouchableOpacity style={compassStyles.compassImageContainer} onPress={() => grabMeasurements(true)}>
        <Image source={require('../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
        {renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.LINEAR);
    const planerToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.PLANAR);

    if (linearToggleOn && planerToggleOn && compassData.trend !== null && compassData.strike !== null) {
      return [renderTrendSymbol(), renderStrikeDipSymbol()];
    }
    else if (linearToggleOn && compassData.trend !== null) return renderTrendSymbol();
    else if (planerToggleOn && compassData.strike !== null) return renderStrikeDipSymbol();
  };

  // const renderDataView = () => {
  //   return (
  //     <View style={uiStyles.alignItemsToCenter}>
  //       <Text>Heading: {compassData.heading}</Text>
  //       <Text>Strike: {compassData.strike}</Text>
  //       <Text>Dip: {compassData.dip}</Text>
  //       <Text>Trend: {compassData.trend}</Text>
  //       <Text>Plunge: {compassData.plunge}</Text>
  //     </View>
  //   );
  // };

  const renderMeasurementTemplates = () => {
    return (
      <React.Fragment>
        <View style={{borderBottomWidth: 1}}>
          <ListItem containerStyle={commonStyles.listItem}>
            <ListItem.Content>
              <ListItem.Title
                style={{fontSize: 12, color: themes.PRIMARY_TEXT_COLOR}}>{'Use measurement type templates'}
              </ListItem.Title>
            </ListItem.Content>
            <Switch onValueChange={(value) => dispatch(setUseMeasurementTemplates(value))}
                    value={useMeasurementTemplates}/>
          </ListItem>
        </View>
        {useMeasurementTemplates && (
          <View style={{borderBottomWidth: 1}}>
            {isEmpty(activeMeasurementTemplates[0]) ? (
                <Button
                  titleStyle={commonStyles.standardButtonText}
                  title={'Select Planar Template'}
                  type={'clear'}
                  onPress={() => dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_PLANAR}))}
                />
              )
              : (
                <ListItem containerStyle={commonStyles.listItem}>
                  <ListItem.Content>
                    <ListItem.Title
                      style={commonStyles.listItemTitle}>{activeMeasurementTemplates[0].name}
                    </ListItem.Title>
                  </ListItem.Content>
                  <Button
                    titleStyle={commonStyles.standardButtonText}
                    title={'Change'}
                    type={'clear'}
                    onPress={() => dispatch(
                      setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_PLANAR}))}
                  />
                </ListItem>
              )}
          </View>
        )}
        {useMeasurementTemplates && (
          <View style={{borderBottomWidth: 1}}>
            {isEmpty(activeMeasurementTemplates[1]) ? (
                <Button
                  titleStyle={commonStyles.standardButtonText}
                  title={'Select Linear Template'}
                  type={'clear'}
                  onPress={() => dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_LINEAR}))}
                />
              )
              : (
                <ListItem containerStyle={commonStyles.listItem}>
                  <ListItem.Content>
                    <ListItem.Title
                      style={commonStyles.listItemTitle}>{activeMeasurementTemplates[1].name}</ListItem.Title>
                  </ListItem.Content>
                  <Button
                    titleStyle={commonStyles.standardButtonText}
                    title={'Change'}
                    type={'clear'}
                    onPress={() => dispatch(
                      setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_LINEAR}))}
                  />
                </ListItem>
              )}
          </View>

        )}
      </React.Fragment>);
  };

  const renderSlider = () => {
    return (
      <Slider
        onSlidingComplete={(value) => setSliderValue(value)}
        value={sliderValue}
        step={1}
        maximumValue={5}
        minimumValue={1}
        labels={['Low', 'High']}
      />
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let image = require('../../assets/images/compass/strike-dip-centered.png');
    const spin = strikeSpinValue.interpolate({
      inputRange: [0, compassData.strike],
      outputRange: ['0deg', compassData.strike + 'deg'],
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

  const renderToggleListItem = (value) => {
    return (
      <ListItem containerStyle={commonStyles.listItem} key={value}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{value}</ListItem.Title>
        </ListItem.Content>
        <Switch onValueChange={() => toggleSwitch(value)} value={toggles.includes(value)}/>
      </ListItem>
    );
  };

  const renderToggles = () => {
    return (
      <React.Fragment>
        {isEmpty(selectedMeasurement) && (
          <React.Fragment>
            {renderToggleListItem(COMPASS_TOGGLE_BUTTONS.PLANAR)}
            {renderToggleListItem(COMPASS_TOGGLE_BUTTONS.LINEAR)}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderTrendSymbol = () => {
    let image = require('../../assets/images/compass/trendLine.png');
    const spin = trendSpinValue.interpolate({
      inputRange: [0, compassData.trend],
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
        style={
          [compassStyles.trendLine,
            // {transform: [{rotate: compassData.trend + 'deg'}]}
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  const subscribeToAccelerometer = async () => {
    const accelerometerSubscriptionTemp = await accelerometer.subscribe((data) => setAccelerometerData(data));
    setAccelerometerSubscription(accelerometerSubscriptionTemp);
    console.log('Began accelerometer subscription.');
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    let switchedToggles = has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType);
    if (isEmpty(switchedToggles)) {
      if (switchType === COMPASS_TOGGLE_BUTTONS.PLANAR) switchedToggles = [COMPASS_TOGGLE_BUTTONS.LINEAR];
      else switchedToggles = [COMPASS_TOGGLE_BUTTONS.PLANAR];
    }
    setToggles(switchedToggles);
    dispatch(setCompassMeasurementTypes(switchedToggles));
  };

  const unsubscribe = () => {
    if (Platform.OS === 'ios') {
      CompassEvents.removeListener('rotationMatrix', matrixRotation);
      console.log('%cEnded Compass observation and rotationMatrix listener.', 'color: red');
    }
    else unsubscribeFromAccelerometer();
    console.log('%cHeading subscription cancelled', 'color: red');
  };

  const unsubscribeFromAccelerometer = () => {
    if (accelerometerSubscription) accelerometerSubscription.unsubscribe();
    setAccelerometerSubscription(null);
    console.log('Ended accelerometer subscription.');
  };

  return (
    <React.Fragment>
      <View>
        {renderMeasurementTemplates()}
        <View style={compassStyles.compassContainer}>
          <TouchableOpacity style={modalStyle.textContainer} onPress={() => grabMeasurements()}>
            <Text style={[modalStyle.textStyle, {'paddingTop': 5}]}>
              Tap compass to
              {modalVisible === MODALS.SHORTCUT_MODALS.COMPASS && ' record a new \nmeasurement in a NEW Spot'}
              {modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS
              && (isEmpty(selectedMeasurement) ? ' record \na new measurement \nor tap HERE to record manually'
                : ' edit current measurement')
              }
            </Text>
          </TouchableOpacity>
          {renderCompass()}
        </View>
        {renderToggles()}
        <View style={compassStyles.sliderContainer}>
          <Text style={compassStyles.sliderHeading}>Quality of Measurement</Text>
          {renderSlider()}
        </View>
      </View>
      {/*<View style={compassStyles.buttonContainer}>*/}
      {/*{showData && renderDataView()}*/}
      {/*</View>*/}
    </React.Fragment>
  );
};

export default Compass;
