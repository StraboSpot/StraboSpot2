import React, {useState, useEffect, useCallback} from 'react';
import {connect} from "react-redux";
import {Animated, Switch, Easing, Alert, Image, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import RNSimpleCompass from 'react-native-simple-compass';
// import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {getNewId, mod, toRadians, toDegrees, roundToDecimalPlaces, isEmpty} from "../../../shared/Helpers";
import {CompassToggleButtons} from "./Compass.constants";
import {Button, ListItem} from "react-native-elements";
// import {Switch} from "react-native-switch";
import {spotReducers} from "../../../spots/Spot.constants";
import {homeReducers, Modals} from "../../../views/home/Home.constants";
import {NotebookPages, notebookReducers} from "../../notebook-panel/Notebook.constants";
import {DeviceMotion, Accelerometer, Magnetometer} from "expo-sensors";
import * as Location from 'expo-location';

// import Orientation from 'react-native-orientation-locker';
import Slider from '../../../shared/ui/Slider';
import Measurements from '../Measurements';
import IconButton from '../../../shared/ui/IconButton';
// Styles
import styles from './CompassStyles';
import * as themes from '../../../shared/styles.constants';

const {height, width} = Dimensions.get('window');

const RNCompass = (props) => {

  let dataView = null;
  // const [magnetometer, setMagnetometer] = useState(0);
  const [accelerometerWithGravity, setAccelerometerWithGravity] = useState(null);
  // const [heading, setHeading] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deviceMotion, setDeviceMotion] = useState({
    rotationAlpha: null,
    rotationBeta: null,
    rotationGamma: null,
    accelerometerIncludingGravityX: null,
    accelerometerIncludingGravityY: null,
    accelerometerIncludingGravityZ: null,
    orientation: null
  });
  const [compassData, setCompassData] = useState({
    heading: null,
    strike: 0,
    dip: 0,
    //   // dipdir: null,
    trend: 0,
    plunge: 0,
    //   // rake: null,
    //   // rake_calculated: 'no'
  });
  const [toggles, setToggles] = useState([CompassToggleButtons.PLANAR]);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue, setStrikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue, setTrendSpinValue] = useState(new Animated.Value(0));
  const [showData, setShowData] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    console.log(`Is device available: ${DeviceMotion.isAvailableAsync()}`);
    DeviceMotion.addListener(DMData => {
      if (isSubscribed) {
        // calculateRotationMatrix(DMData);
        setDeviceMotion({
          rotationAlpha: DMData.rotation.alpha,
          rotationBeta: DMData.rotation.beta,
          rotationGamma: DMData.rotation.gamma,
          orientation: DMData.orientation,
          accelerometerIncludingGravityX: DMData.accelerationIncludingGravity.x,
          accelerometerIncludingGravityY: DMData.accelerationIncludingGravity.y,
          accelerometerIncludingGravityZ: DMData.accelerationIncludingGravity.z
        });
      }
    });
    return () => {
      isSubscribed = false;
      // DeviceMotion.removeAllListeners();
      console.log(`subscription cancelled`)
    }
  }, []);

  useEffect(() => {
    // let isSubscribed = true;
    getLocation();
    // const locationEnabled = isLocationEnabled();
    // console.log(locationEnabled)
    // if (isSubscribed) {
    //  Location.watchHeadingAsync(heading => {
    //     console.log(heading.trueHeading);
    //   });
    // }
    // return () => {
    //   isSubscribed = false;
    //   console.log(`Heading subscription cancelled`)
    // }
    return () => {
      Location.watchHeadingAsync(console.log('expired'))
    }
  }, []);

  const getLocation = async () => {
    const degree_update_rate = 2; // Number of degrees changed before the callback is triggered
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      // degreeFacing = (<Text>{degree}</Text>);
      // console.log('You are facing', degree);
      setCompassData({
        ...compassData,
        heading: degree
      });
    });
    console.log('Compass subscribed');
  };
  // const isLocationEnabled =  () => {
  //   const locationEnabled = Location.hasServicesEnabledAsync();
  //     if (locationEnabled) {
  //       console.log(`Is location enabled: ${locationEnabled}`);
  //     } else console.log(`location NOT enabled: ${locationEnabled}`);
  //
  //   return locationEnabled
  // };

  const calculateRotationMatrix = () => {
    let yaw, pitch, roll, accelerometerX, accelerometerY, accelerometerZ, deviceOrientation;
    let {rotationAlpha, rotationBeta, rotationGamma, accelerometerIncludingGravityX, accelerometerIncludingGravityY, accelerometerIncludingGravityZ, orientation} = deviceMotion;
    yaw = mod(compassData.heading * (Math.PI / 180), 360);
    // yaw = rotationAlpha;
    pitch = rotationBeta;
    roll = rotationGamma;
    accelerometerX = accelerometerIncludingGravityX;
    accelerometerY = accelerometerIncludingGravityY;
    accelerometerZ = accelerometerIncludingGravityZ;
    deviceOrientation = orientation;
    const r11 = Math.cos(roll) * Math.cos(yaw) - Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw);
    const r12 = Math.cos(yaw) * Math.sin(roll) * Math.sin(pitch) + Math.cos(roll) * Math.sin(yaw);
    const r13 = -Math.sin(roll) * Math.cos(pitch);
    const r21 = -Math.cos(pitch) * Math.sin(yaw);
    const r22 = Math.cos(pitch) * Math.cos(yaw);
    const r23 = Math.sin(pitch);
    const r31 = Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(yaw) * Math.sin(roll);
    const r32 = Math.sin(yaw) * Math.sin(roll) - Math.cos(roll) * Math.cos(yaw) * Math.sin(pitch);
    const r33 = Math.cos(roll) * Math.cos(pitch);
    const NED_pole = cartesianToSpherical(r32, -r31, r33);
    const NED_TP = cartesianToSpherical(r22, -r21, r23);
    const strikeAndDip1 = strikeAndDip(NED_pole);
    const trendAndPlunge1 = trendAndPlunge(NED_TP);

    let text = 'Waiting';
    if (errorMessage) {
      text = errorMessage
    }
    else if (compassData.heading) {
      text = roundToDecimalPlaces(mod(compassData.heading - 270, 360), 0);
    }

    return (
      <View style={{alignItems: 'flex-start'}}>
        <Text style={{fontWeight: 'bold'}}>Roll (rotationGamma):</Text>
        <Text style={{color: 'green'}}>{roll}</Text>
        <Text style={{fontWeight: 'bold'}}>Pitch (rotationBeta):</Text>
        <Text style={{color: 'green'}}>{pitch}</Text>
        <Text style={{fontWeight: 'bold'}}>Yaw (rotationAlpha):</Text>
        <Text style={{color: 'green'}}>{yaw}</Text>
        <Text>---------------------</Text>
        <Text style={{fontWeight: 'bold'}}>NED_pole:</Text>
        <Text style={{color: 'red'}}>{NED_pole[0]}</Text>
        <Text style={{color: 'red'}}>{NED_pole[1]}</Text>
        <Text style={{color: 'red'}}>{NED_pole[2]}</Text>
        <Text style={{fontWeight: 'bold'}}>NED_TP:</Text>
        <Text style={{color: 'red'}}>{NED_TP[0]}</Text>
        <Text style={{color: 'red'}}>{NED_TP[1]}</Text>
        <Text style={{color: 'red'}}>{NED_TP[2]}</Text>

        {/*<Text style={{fontWeight: 'bold'}}>Accelerometer w/ gravity X:</Text>*/}
        {/*<Text style={{color: 'red'}}>{accelerometerX}</Text>*/}
        {/*<Text style={{fontWeight: 'bold'}}>Accelerometer w/ gravity Y:</Text>*/}
        {/*<Text style={{color: 'red'}}>{accelerometerY}</Text>*/}
        {/*<Text style={{fontWeight: 'bold'}}>Accelerometer w/ gravity Z:</Text>*/}
        {/*<Text style={{color: 'red'}}>{accelerometerZ}</Text>*/}
        <Text>---------------------</Text>
        <Text>Orientation: {deviceOrientation}</Text>

        <Text>Device Heading: {text}</Text>
        <Text>Strike: {strikeAndDip1[0]}</Text>
        <Text>Dip: {strikeAndDip1[1]}</Text>
        <Text>Trend: {trendAndPlunge1[0]}</Text>
        <Text>Plunge: {trendAndPlunge1[1]}</Text>
      </View>
    );
  };

  const strikeAndDip = (NED) => {
    const phi = NED[1];
    const theta = -NED[2];
    let strikeDeg = compassData.heading;
    let dipDeg = null;
    if (phi <= Math.PI / 2) {
      strikeDeg = mod(360 - (theta * (180 / Math.PI)), 360);
      // strikeDeg = mod(360 - theta * (180 / Math.PI), 360);
      dipDeg = phi * (180 / Math.PI);
    }
    else {
      strikeDeg = mod(360 - (theta - Math.PI) * (180 / Math.PI), 360);
      dipDeg = (Math.PI - phi) * (180 / Math.PI);
    }
    return [roundToDecimalPlaces(strikeDeg, 0), roundToDecimalPlaces(dipDeg, 0)];
  };

  const trendAndPlunge = (NED) => {
    const phi = NED[1];
    const theta = NED[2];
    let trendDeg = mod(theta * (180 / Math.PI), 360);
    let plungeDeg = phi * (180 / Math.PI) - 90;
    if (plungeDeg < 0) {
      trendDeg = mod(trendDeg + 180, 360);
      plungeDeg = -plungeDeg
    }
    return [roundToDecimalPlaces(trendDeg, 2), roundToDecimalPlaces(plungeDeg, 2)];
  };

  const cartesianToSpherical = (r1, r2, r3) => {
    let rho = Math.sqrt(Math.pow(r1, 2) + Math.pow(r2, 2) + Math.pow(r3, 2));
    let phi = 0;
    let theta = 0;
    if (rho === 0) {
      phi = 0;
      theta = 0;
    }
    else {
      phi = Math.acos(r3 / rho);
      if (rho * Math.sin(phi) === 0) {
        if (r3 >= 0) {
          rho = r3;
          phi = 0;
          theta = 0;
        }
        else {
          rho = -r3;
          phi = Math.PI;
          theta = 0;
        }
      }
      else {
        theta = Math.atan2(r2, r1)
      }
    }
    return [rho, phi, theta]
  };

  const viewData = () => {
    setShowData(!showData)
  };


  let modalView = <View>
    <Button
      title={'View In Shortcut Mode'}
      type={'clear'}
      titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
      onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
    />
    <Button
      title={'Toggle data view'}
      type={'clear'}
      titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
      onPress={() => {
        viewData()
      }}
    />

    {/*<Button*/}
    {/*  title={'Toggle device motion modal'}*/}
    {/*  type={'clear'}*/}
    {/*  containerStyle={{margin: 0, padding: 0}}*/}
    {/*  titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}*/}
    {/*  onPress={() => {*/}
    {/*    this.viewDeviceMotionModal()*/}
    {/*  }}*/}
    {/*/>*/}
  </View>;

  const renderDataView = () => {
    let text = 'Waiting';
    if (errorMessage) {
      text = errorMessage
    }
    else if (compassData.heading) {
      text = mod(compassData.heading - 270, 360);
    }
    if (compassData === null) {
      dataView =
        <View style={{alignItems: 'flex-start'}}>
          <Text>Spinner</Text>
        </View>;
    }
    else {
      return (
        <View style={{alignItems: 'flex-start'}}>
          {/*<Text>Heading: {heading}</Text>*/}
          <Text>{text}</Text>
          <Text>Strike: {compassData.strike}</Text>
          <Text>Dip: {compassData.dip}</Text>
          <Text>Trend: {compassData.trend}</Text>
          <Text>Plunge: {compassData.plunge}</Text>
        </View>
      );
    }
  };

  const renderSlider = () => {
    return (
      <Slider
        // setSliderValue={(value) => this.sliderValueChange(value)}
        onSlidingComplete={(value) => setSliderValue(value)}
        sliderValue={sliderValue}
        thumbTouchSize={{width: 80, height: 80}}
        leftText={'Low Quality'}
        rightText={'High Quality'}
      />
    );
  };

  const renderToggles = () => {
    return (
      Object.keys(CompassToggleButtons).map((key, i) => (
        <ListItem
          containerStyle={styles.toggleButtonsContainer}
          key={key}
          title={
            <View style={styles.itemContainer}>
              <Text style={styles.itemTextStyle}>{CompassToggleButtons[key]}</Text>
              <View style={styles.switchContainer}>
                <Switch
                  // style={styles.switch}
                  trackColor={{false: themes.SECONDARY_BACKGROUND_COLOR, true: 'red'}}
                  // ios_backgroundColor={'lightgrey'}
                  onValueChange={() => toggleSwitch(CompassToggleButtons[key])}
                  value={toggles.includes(CompassToggleButtons[key])}
                />
                {/*<Switch*/}
                {/*  style={styles.switch}*/}
                {/*  value={toggles.includes(CompassToggleButtons[key])}*/}
                {/*  onValueChange={(val) => toggleSwitch(CompassToggleButtons[key])}*/}
                {/*  circleSize={25}*/}
                {/*  barHeight={20}*/}
                {/*  circleBorderWidth={3}*/}
                {/*  backgroundActive={'#407ad9'}*/}
                {/*  backgroundInactive={'gray'}*/}
                {/*  circleActiveColor={'#000000'}*/}
                {/*  circleInActiveColor={'#000000'}*/}
                {/*  changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete*/}
                {/*  innerCircleStyle={{*/}
                {/*    alignItems: "center",*/}
                {/*    justifyContent: "center"*/}
                {/*  }} // style for inner animated circle for what you (may) be rendering inside the circle*/}
                {/*/>*/}
              </View>
            </View>}
        />
      ))
    );
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    console.log(toggles, has)
    setToggles(has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType));
  };

  return (
    <React.Fragment>
      <View>
        <View style={styles.toggleButtonsRowContainer}>
          {renderToggles()}
        </View>
        <View style={styles.sliderContainer}>
          <Text>Current Set Value: {sliderValue}</Text>
          {renderSlider()}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {modalView}
        {/*{this.state.showDeviceMotionModal && deviceMotionModal}*/}
        {showData ? calculateRotationMatrix() : null}
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};
export default connect(mapStateToProps, mapDispatchToProps)(RNCompass);
