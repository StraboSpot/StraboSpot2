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
import {accelerometer, SensorTypes, setUpdateIntervalForType, magnetometer} from 'react-native-sensors';
import Sound from 'react-native-sound';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, mod, roundToDecimalPlaces, toDegrees, toRadians} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import modalStyle from '../../shared/ui/modal/modal.style';
import Slider from '../../shared/ui/Slider';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import useMapsHook from '../maps/useMaps';
import useMeasurementsHook from '../measurements/useMeasurements';
import {setUseMeasurementTemplates} from '../project/projects.slice';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import {setCompassMeasurements, setCompassMeasurementTypes} from './compass.slice';
import compassStyles from './compass.styles';

const Compass = (props) => {
  let accelerometerSubscription, magnetometerSubscription;
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedMeasurement = useSelector(state => state.spot.selectedMeasurement);
  const useMeasurementTemplates = useSelector(state => state.project.project?.templates?.useMeasurementTemplates);
  const activeMeasurementTemplates = useSelector(
    state => state.project.project?.templates?.activeMeasurementTemplates) || [];

  const [accelerometerData, setAccelerometerData] = useState({x: 0, y: 0, z: 0, timestamp: null});
  const [compassData, setCompassData] = useState({
    accelX: 0,
    accelY: 0,
    accelZ: 0,
    magX: 0,
    magY: 0,
    magZ: 0,
    heading: 0,
    strike: 0,
    dip_direction: 0,
    dip: 0,
    trend: 0,
    plunge: 0,
    rake: 0,
    rake_calculated: 'yes',
    quality: 0,
  });
  // const [magnetometerData, setMagnetometerData] = useState(null);
  // const [showData, setShowData] = useState(true);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [toggles, setToggles] = useState(compassMeasurementTypes);
  const [buttonSound, setButtonSound] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);

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
      // setUpdateIntervalForType(SensorTypes.accelerometer, 100);
      // setUpdateIntervalForType(SensorTypes.magnetometer, 100);
      subscribeToSensors().catch(e => console.log('Error with Sensors', e));
    }
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      unsubscribe();
    };
  }, []);

  // Update compass data on accelerometer data changed
  useEffect(() => {
    displayCompassData();
    console.log(compassData)
  }, [accelerometerData, compassData]);

  // Create a new measurement on grabbing new compass measurements from shortcut modal
  useEffect(() => {
    if (!isEmpty(compassMeasurements) && modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT) {
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

  const calculateAndroidOrientation = (res) => {
    // console.log(res)
    if (res) {
      setCompassData({
        ...compassData,
        // accelX: accelerometerData.x,
        // accelY: accelerometerData.y,
        // accelZ: accelerometerData. z,
        // magX: compassHeading?.x,
        // magY: compassHeading?.y,
        // magZ: compassHeading?.z,
        M11: roundToDecimalPlaces(res?.M11, 3),
        M12: roundToDecimalPlaces(res?.M12, 3),
        M13: roundToDecimalPlaces(res?.M13, 3),
        M21: roundToDecimalPlaces(res?.M21, 3),
        M22: roundToDecimalPlaces(res?.M22, 3),
        M23: roundToDecimalPlaces(res?.M23, 3),
        M31: roundToDecimalPlaces(res?.M31, 3),
        M32: roundToDecimalPlaces(res?.M32, 3),
        M33: roundToDecimalPlaces(res?.M33, 3),
        // heading: roundToDecimalPlaces(compassHeading, 4),
        // heading: degree(actualHeading),
        // strike: roundToDecimalPlaces(strike, 0),
        // dip_direction: roundToDecimalPlaces(dipdir, 0),
        // dip: roundToDecimalPlaces(dip, 0),
        // trend: roundToDecimalPlaces(trend, 0),
        // plunge: roundToDecimalPlaces(plunge, 0),
        // rake: roundToDecimalPlaces(rake, 0),
        // rake_calculated: 'yes',
        // quality: sliderValue.toString(),
      });
    }
  };

  const calculateOrientation = (res) => {
    const x = accelerometerData.x;
    const y = accelerometerData.y;
    const z = accelerometerData.z;
    // let actualHeading = magnetometerData ? mod(magnetometerData.z , 360) : 0;  // ToDo: adjust for declination
    let actualHeading = angle(compassHeading);
    // console.log(magnetometerData);
    // console.log(actualHeading)
    // console.log('accelX', accelerometerData.x );
    // console.log('accelY', accelerometerData.y );
    // console.log('accelZ', accelerometerData.z );
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
      accelX: x,
      accelY: y,
      accelZ: z,
      magX: compassHeading?.x,
      magY: compassHeading?.y,
      magZ: compassHeading?.z,
      // M11: roundToDecimalPlaces(res?.M11, 3),
      // M12: roundToDecimalPlaces(res?.M12, 3),
      // M13: roundToDecimalPlaces(res?.M13, 3),
      // M21: roundToDecimalPlaces(res?.M21, 3),
      // M22: roundToDecimalPlaces(res?.M22, 3),
      // M23: roundToDecimalPlaces(res?.M23, 3),
      // M31: roundToDecimalPlaces(res?.M31, 3),
      // M32: roundToDecimalPlaces(res?.M32, 3),
      // M33: roundToDecimalPlaces(res?.M33, 3),
      // heading: roundToDecimalPlaces(compassHeading, 4),
      heading: degree(actualHeading),
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
    // else calculateOrientation();
    else subscribeToSensors();
  };

  const grabMeasurements = async (isCompassMeasurement) => {
    if (modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT) {
      await useMaps.setPointAtCurrentLocation();
      await props.goToCurrentLocation();
    }
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
    if (state === 'active') Platform.OS === 'ios' ? displayCompassData() : subscribeToSensors();
    else if (state === 'background' || state === 'inactive') {
      dispatch(setModalVisible({modal: null}));
      unsubscribe();
    }
  };

  const androidMatrixRotation = res => {
    if (res) {
      setCompassData({
        ...compassData,
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
                  onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_PLANAR}))}
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
                      setModalVisible({modal: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_PLANAR}))}
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
                  onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_LINEAR}))}
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
                      setModalVisible({modal: MODAL_KEYS.OTHER.MEASUREMENT_TEMPLATES_LINEAR}))}
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
        style={
          [compassStyles.trendLine,
            // {transform: [{rotate: compassData.trend + 'deg'}]}
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  const angle = magnetometer => {
    let angle = 0;
    if (magnetometer) {
      let {x, y} = magnetometer;
      if (Math.atan2(y, x) >= 0) {
        angle = Math.atan2(y, x) * (180 / Math.PI);
      }
      else {
        angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
      }
    }
    // console.log('ANGLE', angle);
    return Math.round(angle);
  };

  const degree = magnetometer => {
    return magnetometer - 90 >= 0
      ? magnetometer - 90
      : magnetometer + 271;
  };

  const direction = degree => {
    if (degree >= 22.5 && degree < 67.5) {
      return 'NE';
    }
    else if (degree >= 67.5 && degree < 112.5) {
      return 'E';
    }
    else if (degree >= 112.5 && degree < 157.5) {
      return 'SE';
    }
    else if (degree >= 157.5 && degree < 202.5) {
      return 'S';
    }
    else if (degree >= 202.5 && degree < 247.5) {
      return 'SW';
    }
    else if (degree >= 247.5 && degree < 292.5) {
      return 'W';
    }
    else if (degree >= 292.5 && degree < 337.5) {
      return 'NW';
    }
    else {
      return 'N';
    }
  };

  const subscribeToSensors = async () => {
    const compassEventEmitter = new NativeEventEmitter(NativeModules.AndroidCompass);
    compassEventEmitter.addListener('androidCompassData', calculateAndroidOrientation);
    NativeModules.AndroidCompass.start();
    // accelerometerSubscription = await accelerometer.subscribe((data) => {
    //   //   // console.log('Acc Data', data);
    //   setAccelerometerData(data);
    // });
    // console.log(accelerometerSubscription);
    // magnetometerSubscription = await magnetometer.subscribe((data) => {
    //   setCompassHeading(data);
    //   // console.log('Magnetometer Data', data);
    // });
    // console.log(magnetometerSubscription);
    console.log('Began accelerometer and magnetometer subscription.');
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
    else unsubscribeFromSensors();
    console.log('%cHeading subscription cancelled', 'color: red');
  };

  const unsubscribeFromSensors = () => {
    if (accelerometerSubscription) accelerometerSubscription.unsubscribe();
    if (magnetometerSubscription) magnetometerSubscription.unsubscribe();
    NativeModules.AndroidCompass.stop();
    console.log('%cEnded accelerometer and magnetometer subscription.', 'color: red');
  };

  return (
    <React.Fragment>
      <View>
        {renderMeasurementTemplates()}
        <View style={compassStyles.compassContainer}>
          <TouchableOpacity style={modalStyle.textContainer} onPress={() => grabMeasurements()}>
            <Text style={[modalStyle.textStyle, {'paddingTop': 5}]}>
              Tap compass to
              {modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT && ' record a new \nmeasurement in a NEW Spot'}
              {modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS
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
      {props.setCompassRawDataToDisplay && (
        <Button
          title={'Show Compass Data'}
          type={'clear'}
          onPress={props.showCompassDataModal}
          compassData={props.setCompassRawDataToDisplay(compassData)}
        />
      )}
    </React.Fragment>
  );
};

export default Compass;
