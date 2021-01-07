import React, {useState, useEffect} from 'react';
import {
  Animated,
  Easing,
  Alert,
  Image,
  View,
  Switch,
  Text,
  Dimensions,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter, Platform,
} from 'react-native';

import {ListItem} from 'react-native-elements';
import {accelerometer, SensorTypes, setUpdateIntervalForType} from 'react-native-sensors';
import Sound from 'react-native-sound';
import {connect, useDispatch, useSelector} from 'react-redux';

import {getNewId, mod, roundToDecimalPlaces, toDegrees, toRadians} from '../../../shared/Helpers';
import modalStyle from '../../../shared/ui/modal/modal.style';
import Slider from '../../../shared/ui/Slider';
import uiStyles from '../../../shared/ui/ui.styles';
import {MODALS} from '../../home/home.constants';
import useMapsHook from '../../maps/useMaps';
import {NOTEBOOK_SUBPAGES} from '../../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../../notebook-panel/notebook.slice';
import {editedSpotProperties, setSelectedAttributes} from '../../spots/spots.slice';
import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import compassStyles from './compass.styles';

// eslint-disable-next-line no-unused-vars
const {height, width} = Dimensions.get('window');
const buttonClick = new Sound('button_click.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) console.log('failed to load the sound', error);
});

const Compass = (props) => {
  const dispatch = useDispatch();
  let modalView = null;
  const [useMaps] = useMapsHook();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const [compassData, setCompassData] = useState({
    heading: null,
    strike: null,
    dip: null,
    // dipdir: null,
    trend: null,
    plunge: null,
    //   // rake: null,
    //   // rake_calculated: 'no'
  });
  const [heading, setHeading] = useState(null);
  const compassMeasurementTypes = useSelector(state => state.notebook.compassMeasurementTypes);
  const [toggles, setToggles] = useState(compassMeasurementTypes);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [showData, setShowData] = useState(false);
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);
  const [magnetometer, setMagnetometer] = useState(0);
  const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: null,
  });

  useEffect(() => {
    displayCompassData();
  }, [accelerometerData]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setUpdateIntervalForType(SensorTypes.accelerometer, 300);
      setUpdateIntervalForType(SensorTypes.magnetometer, 300);
      subscribeToAccelerometer();
    }
    return () => {
      if (Platform.OS === 'ios') {
        NativeModules.Compass.stopObserving();
        CompassEvents.removeAllListeners('rotationMatrix');
        console.log('Ended Compass observation and rotationMatrix listener.');
      }
      else unsubscribeFromAccelerometer();
      console.log('Heading subscription cancelled');
    };
  }, []);

  useEffect(() => {
    console.log('Updating props', props.spot);
  }, [props.spot, compassMeasurementTypes]);

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
      actualHeading: roundToDecimalPlaces(actualHeading, 4),
      strike: roundToDecimalPlaces(strike, 0),
      dipdir: roundToDecimalPlaces(dipdir, 0),
      dip: roundToDecimalPlaces(dip, 0),
      trend: roundToDecimalPlaces(trend, 0),
      plunge: roundToDecimalPlaces(plunge, 0),
      rake: roundToDecimalPlaces(rake, 0),
      rake_calculated: 'yes',
    });
  };

  const displayCompassData = () => {
    if (Platform.OS === 'ios') {
      NativeModules.Compass.myDeviceRotation();
      CompassEvents.addListener('rotationMatrix', res => {
        console.log('Began Compass observation and rotationMatrix listener.');
        setCompassData({
          heading: res.heading,
          strike: res.strike,
          dip: res.dip,
          trend: res.trend,
          plunge: res.plunge,
        });
      });
    }
    else {
      calculateOrientation();
    }
  };

  const playSound = () => {
    buttonClick.play(success => {
      if (success) console.log('successfully finished playing');
      else console.log('playback failed due to audio decoding errors');
    });
  };

  const grabMeasurements = async (isCompassMeasurement) => {
    if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    let measurements = [];
    if (toggles.includes(COMPASS_TOGGLE_BUTTONS.PLANAR)) {
      let newPlanarMeasurement = {
        type: 'planar_orientation',
        quality: sliderValue.toString(),
      };
      if (isCompassMeasurement) {
        newPlanarMeasurement = {
          ...newPlanarMeasurement,
          strike: compassData.strike,
          dip: compassData.dip,
        };
      }
      measurements.push(newPlanarMeasurement);
    }
    if (toggles.includes(COMPASS_TOGGLE_BUTTONS.LINEAR)) {
      let newLinearMeasurement = {
        type: 'linear_orientation',
        quality: sliderValue.toString(),
      };
      if (isCompassMeasurement) {
        newLinearMeasurement = {
          ...newLinearMeasurement,
          trend: compassData.trend,
          plunge: compassData.plunge,
          rake: compassData.rake,
          rake_calculated: 'yes',
        };
      }
      measurements.push(newLinearMeasurement);
    }

    if (measurements.length > 0) {
      let newOrientation = measurements[0];
      newOrientation.id = getNewId();
      if (measurements.length > 1) {
        let newAssociatedOrientation = measurements[1];
        newAssociatedOrientation.id = getNewId();
        newOrientation.associated_orientation = [newAssociatedOrientation];
      }
      if (modalVisible === MODALS.NOTEBOOK_MODALS.COMPASS) {
        const orientations = (typeof props.spot.properties.orientation_data === 'undefined')
          ? [newOrientation] : [...props.spot.properties.orientation_data, newOrientation];
        props.onSpotEdit('orientation_data', orientations);
      }
      else if (modalVisible === MODALS.SHORTCUT_MODALS.COMPASS) {
        props.onSpotEdit('orientation_data', [newOrientation]);
      }
      if (isCompassMeasurement) playSound();
      else {
        dispatch(setSelectedAttributes([newOrientation]));
        dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
      }
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  const renderCompass = () => {
    return (
      <TouchableOpacity style={compassStyles.compassImageContainer} onPress={() => grabMeasurements(true)}>
        <Image source={require('../../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
        {renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearInToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.LINEAR);
    const plannerInToggleOn = toggles.includes(COMPASS_TOGGLE_BUTTONS.PLANAR);

    if (linearInToggleOn && plannerInToggleOn && compassData.trend !== null && compassData.strike !== null) {
      return (
        [renderTrendSymbol(), renderStrikeDipSymbol()]
      );
    }
    else if (linearInToggleOn && compassData.trend !== null) {
      return renderTrendSymbol();

    }
    else if (plannerInToggleOn && compassData.strike !== null) {
      return renderStrikeDipSymbol();
    }

  };

  const renderDataView = () => {
    return (
      <View style={uiStyles.alignItemsToCenter}>
        <Text>Heading: {compassData.heading}</Text>
        <Text>Strike: {compassData.strike}</Text>
        <Text>Dip: {compassData.dip}</Text>
        <Text>Trend: {compassData.trend}</Text>
        <Text>Plunge: {compassData.plunge}</Text>
      </View>
    );
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let image = require('../../../assets/images/compass/strike-dip-centered.png');
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
        style={
          [compassStyles.strikeAndDipLine,
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  const renderSlider = () => {
    return (
      <Slider
        onSlidingComplete={(value) => setSliderValue(value)}
        value={sliderValue}
        step={1}
        maximumValue={5}
        minimumValue={1}
        thumbTouchSize={{width: 40, height: 40}}
        leftText={'Low'}
        rightText={'High'}
      />
    );
  };

  const renderToggles = () => {
    return (
      Object.entries(COMPASS_TOGGLE_BUTTONS).map(([key, value], i) => (
        <ListItem key={key}>
          <ListItem.Content>
            <ListItem.Title>{value}</ListItem.Title>
          </ListItem.Content>
          <Switch onValueChange={() => toggleSwitch(value)} value={toggles.includes(value)}/>
        </ListItem>
      ))
    );
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    console.log(toggles, has);
    setToggles(has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType));
  };

  // Render the strike and dip symbol inside the compass
  const renderTrendSymbol = () => {
    let image = require('../../../assets/images/compass/trendLine.png');
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

  const unsubscribeFromAccelerometer = () => {
    if (accelerometerSubscription) accelerometerSubscription.unsubscribe();
    setAccelerometerSubscription(null);
    console.log('Ended accelerometer subscription.');
  };

  return (
    <View>
      <View>
        <View style={compassStyles.compassContainer}>
          <TouchableOpacity style={modalStyle.textContainer} onPress={() => grabMeasurements()}>
            {/*<Text style={{...modalStyle.textStyle, fontWeight: 'bold'}}>x Spots Created </Text>*/}
            <Text style={modalStyle.textStyle}>Tap compass to record a measurement</Text>
            {modalVisible !== MODALS.NOTEBOOK_MODALS.COMPASS && <Text style={modalStyle.textStyle}>in a NEW Spot</Text>}
            <Text style={modalStyle.textStyle}>or tap HERE to record manually</Text>
          </TouchableOpacity>
          {renderCompass()}
        </View>
        <View style={compassStyles.toggleButtonsRowContainer}>
          {renderToggles()}
        </View>
        <View style={compassStyles.sliderContainer}>
          <Text style={compassStyles.sliderHeading}>Quality of Measurement</Text>
          {renderSlider()}
        </View>
      </View>
      <View style={compassStyles.buttonContainer}>
        {modalView}
        {showData && renderDataView()}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
  };
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => (editedSpotProperties({field: field, value: value})),
};
export default connect(mapStateToProps, mapDispatchToProps)(Compass);
