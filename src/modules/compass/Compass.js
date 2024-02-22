import React, {useEffect, useState} from 'react';
import {
  Animated,
  AppState,
  Easing,
  Image,
  NativeEventEmitter,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {COMPASS_TOGGLE_BUTTONS} from './compass.constants';
import {setCompassMeasurements} from './compass.slice';
import compassStyles from './compass.styles';
import CompassModule from '../../services/CompassModule';
import useCompassHook from '../../services/useCompass';
import {isEmpty, roundToDecimalPlaces} from '../../shared/Helpers';
import DeviceSound from '../../utils/sounds/sound';
import {setModalVisible} from '../home/home.slice';
import overlayStyles from '../home/overlays/overlay.styles';
import useLocationHook from '../maps/useLocation';
import useMeasurementsHook from '../measurements/useMeasurements';
import {MODAL_KEYS} from '../page/page.constants';
import image from '../../assets/images/compass/strike-dip-centered.png';

const Compass = ({
                   closeCompass,
                   setAttributeMeasurements,
                   setMeasurements,
                   sliderValue,
                 }) => {
  const CompassEvents = new NativeEventEmitter(CompassModule);
  const {startSensors, stopSensors, myDeviceRotation, stopObserving} = CompassModule;

  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const modalVisible = useSelector(state => state.home.modalVisible);

  const useCompass = useCompassHook();
  const useLocation = useLocationHook();

  const [strikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue] = useState(new Animated.Value(0));
  const [buttonSound, setButtonSound] = useState(null);
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
  const [matrixRotation, setMatrixRotation] = useState({});
  const [showCompassRawDataView, setShowCompassRawDataView] = useState(false);
  // const [userDeclination, setUserDeclination] = useState('');
  const useMeasurements = useMeasurementsHook();

  useEffect(() => {
    console.log('UE Compass []');
    const buttonClick = new DeviceSound('compass_button_click.mp3', DeviceSound.MAIN_BUNDLE, (error) => {
      if (error) console.log('Failed to load sound', error);
    });
    setButtonSound(buttonClick);
  }, []);

  useEffect(() => {
    console.log('UE Compass []');
    displayCompassData()
      .then(() => console.log('SENSORS ARE RUNNING'));
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

  const displayCompassData = async () => {
    // const userDeclination = await getDeclination();
    // console.log('User declination', userDeclination);
    console.log('Subscribing to data!');
    subscribe();
    console.log('Subscribing to data!');

  };

  const getDeclination = async () => {
    const declination = await useLocation.getCurrentLocation();
    console.log('Declination is:', declination);
    return declination;
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
      setShowCompassRawDataView(false);
      unsubscribe();
    }
  };

  const getCartesianToSpherical = async (matrixRotationData) => {
    let ENU_Pole;
    let ENU_TP;
    if (Platform.OS === 'ios') {
      ENU_Pole = await useCompass.cartesianToSpherical(-matrixRotationData.M32, matrixRotationData.M31,
        matrixRotationData.M33);
      ENU_TP = await useCompass.cartesianToSpherical(-matrixRotationData.M22, matrixRotationData.M21,
        matrixRotationData.M23);
    }
    else {
      ENU_Pole = await useCompass.cartesianToSpherical(matrixRotationData.M31, matrixRotationData.M32,
        matrixRotationData.M33);
      ENU_TP = await useCompass.cartesianToSpherical(matrixRotationData.M21, matrixRotationData.M22,
        matrixRotationData.M23);
    }
    const strikeAndDip = await useCompass.strikeAndDip(ENU_Pole);
    const trendAndPlunge = await useCompass.trendAndPlunge(ENU_TP);
    setCompassData({
      heading: roundToDecimalPlaces(matrixRotationData.heading, 0),
      strike: roundToDecimalPlaces(strikeAndDip.strike, 0),
      dip: roundToDecimalPlaces(strikeAndDip.dip, 0),
      trend: roundToDecimalPlaces(trendAndPlunge.trend, 0),
      plunge: roundToDecimalPlaces(trendAndPlunge.plunge, 0),
    });
  };

  const matrixRotationData = async (res) => {
    // console.log('Matrix Data', res);

    // if (Platform.OS === 'android') {

    await getCartesianToSpherical(res);
    // }
    setMatrixRotation({
      heading: roundToDecimalPlaces(res.heading, 0),
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

  const matrixAverage = async (res) => {
    console.log('Matrix Average', res);
    await getCartesianToSpherical(res, true);
  };

  const Row = ({children}) => (
    <View style={compassStyles.compassDataGridRow}>{children}</View>
  );
  const Col = ({numRows, children}) => {
    return (
      <View style={compassStyles[`compassDataCol${numRows}`]}>{children}</View>
    );
  };

  const renderColumnLabels = () => {
    if (Platform.OS === 'ios') {
      return (
        <>
          <Text>North</Text>
          <Text>West</Text>
          <Text>Up</Text>
        </>
      );
    }
    else {
      return (
        <>
          <Text>East</Text>
          <Text>North</Text>
          <Text>Up</Text>
        </>
      );
    }
  };

  const renderCompassData = () => (
    <View style={{
      // flex: 1,
      // backgroundColor: 'white',
      // padding: 20,
      // borderBottomRightRadius: 20,
      // borderTopRightRadius: 20,
      // zIndex: 100,
    }}>
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>Compass Data</Text>
      </View>
      <View style={compassStyles.compassDataGridContainer}>
        <Text style={overlayStyles.titleText}>Matrix Rotation</Text>
        <View style={compassStyles.compassDataDirectionTextContainer}>
          {renderColumnLabels()}
        </View>
        <Row>
          <Col numRows={1}>
            <Text style={compassStyles.compassDataText}>X</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M11: {'\n'}{roundToDecimalPlaces(matrixRotation.M11, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M12: {'\n'}{roundToDecimalPlaces(matrixRotation.M12, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M13: {'\n'}{roundToDecimalPlaces(matrixRotation.M13, 3)}</Text>
          </Col>
        </Row>
        <Row>
          <Col numRows={1}>
            <Text style={compassStyles.compassDataText}>Y</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M21: {'\n'}{roundToDecimalPlaces(matrixRotation.M21, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M22: {'\n'}{roundToDecimalPlaces(matrixRotation.M22, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M23: {'\n'}{roundToDecimalPlaces(matrixRotation.M23, 3)}</Text>
          </Col>
        </Row>
        <Row>
          <Col numRows={1}>
            <Text style={compassStyles.compassDataText}>Z</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M31: {'\n'}{roundToDecimalPlaces(matrixRotation.M31, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M32: {'\n'}{roundToDecimalPlaces(matrixRotation.M32, 3)}</Text>
          </Col>
          <Col numRows={3}>
            <Text style={compassStyles.compassDataText}>M33: {'\n'}{roundToDecimalPlaces(matrixRotation.M33, 3)}</Text>
          </Col>
        </Row>
      </View>
    </View>
  );

  const renderCompassMeasurementsText = () => {
  if (compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.PLANAR) && compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.LINEAR)) {
      return (
        <>
          <Text style={compassStyles.compassDataText}>Strike: {compassData.strike}</Text>
          <Text style={compassStyles.compassDataText}>Dip: {compassData.dip}</Text>
          <Text style={compassStyles.compassDataText}>Trend: {compassData.trend}</Text>
          <Text style={compassStyles.compassDataText}>Plunge: {compassData.plunge}</Text>
        </>
      );
    }

   else if (compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.PLANAR)) {
      return (
        <>
          <Text style={compassStyles.compassDataText}>Strike: {compassData.strike}</Text>
          <Text style={compassStyles.compassDataText}>Dip: {compassData.dip}</Text>
        </>
      );
    }

    else if (compassMeasurementTypes.includes(COMPASS_TOGGLE_BUTTONS.LINEAR)) {
      return (
        <>
          <Text style={compassStyles.compassDataText}>Trend: {compassData.trend}</Text>
          <Text style={compassStyles.compassDataText}>Plunge: {compassData.plunge}</Text>
        </>
      );
    }
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
    let spin;
    let image = require('../../assets/images/compass/strike-dip-centered.png');
    if (compassData.strike > 0) {
      spin = strikeSpinValue.interpolate({
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
        <View style={{alignContent: 'center', backgroundColor: 'green'}}>
          <Animated.Image
            key={image}
            source={image}
            style={[compassStyles.strikeAndDipLine, {transform: [{rotate: spin}]}]}/>
        </View>

      );
    }
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

  const subscribe = () => {
    try {
      CompassEvents.addListener('rotationMatrix', matrixRotationData);

      Platform.OS === 'ios' ? myDeviceRotation() : startSensors();
      console.log('%cSUBSCRIBING to native compass data!', 'color: green');
    }
    catch (err) {
      console.error(('Error subscribing to the native data: ' + err));
    }
  };

  const unsubscribe = () => {
    try {
      CompassEvents.addListener('rotationMatrix', matrixRotationData).remove();

      Platform.OS === 'ios' ? stopObserving() : stopSensors();
      console.log('%cEnded Compass observation and rotationMatrix listener.', 'color: red');
    }
    catch (err) {
      console.error('Error unsubscribing to compass events', err);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={compassStyles.compassContainer}>
        <View style={compassStyles.compassImageContainer}>
          <Pressable  onPress={() => grabMeasurements(true)}>
            <Image source={require('../../assets/images/compass/compass.png')} style={compassStyles.compassImage}/>
            <View style={{alignItems: 'center'}}>
              {renderCompassSymbols()}
            </View>
          </Pressable>

        </View>
        <View style={compassStyles.matrixDataButtonContainer}>
          <View style={compassStyles.compassMeasurementTextContainer}>
            {renderCompassMeasurementsText()}
          </View>
          <Button
            containerStyle={compassStyles.matrixDataButtonContainer}
            titleStyle={{fontSize: 10}}
            title={showCompassRawDataView ? 'Hide Matrix Data' : 'Display Matrix Data'}
            type={'clear'}
            onPress={() => setShowCompassRawDataView(!showCompassRawDataView)}
          />
        </View>
      </View>
      <View style={{}}>
      {showCompassRawDataView && renderCompassData()}
      </View>
    </View>
  );
};

export default Compass;
