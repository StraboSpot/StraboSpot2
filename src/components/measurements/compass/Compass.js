// import RNSimpleCompass from 'react-native-simple-compass';
import React, {Component} from 'react';
import {connect} from "react-redux";
import {Animated, Easing, Alert, Image, View, Text, Dimensions, TouchableOpacity} from 'react-native';
// import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {getNewId, mod, toRadians, toDegrees, roundToDecimalPlaces, isEmpty} from "../../../shared/Helpers";
import {CompassToggleButtons} from "./Compass.constants";
import {Button, ListItem} from "react-native-elements";
import {Switch} from "react-native-switch";
import {spotReducers} from "../../../spots/Spot.constants";
import {homeReducers, Modals} from "../../../views/home/Home.constants";
import {NotebookPages, notebookReducers} from "../../notebook-panel/Notebook.constants";
import {DeviceMotion, Accelerometer, Magnetometer} from "expo-sensors";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';


// import Orientation from 'react-native-orientation-locker';
import Slider from '../../../shared/ui/Slider';
import Measurements from '../Measurements';
import IconButton from '../../../shared/ui/IconButton';

// Styles
import styles from './CompassStyles';
import * as themes from '../../../shared/styles.constants';

const {height, width} = Dimensions.get('window');
const degree_update_rate = 2; // Number of degrees changed before the callback is triggered
let degreeFacing = null;

class Compass extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    // setUpdateIntervalForType(SensorTypes.accelerometer, 300);
    // setUpdateIntervalForType(SensorTypes.magnetometer, 300);

    this.state = {
      headingAvgArr: [],
      magnetometer: 0,
      accelerometer: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: null
      },
      subscriptions: {
        accelerometer: null,
      },
      deviceMotion: {
        // acceleration: {
        // accelerationX: null,
        // accelerationY: null,
        // accelerationZ: null,
        // },
        // accelerationIncludingGravity: {
        // accelerationIncludingGravityX: null,
        // accelerationIncludingGravityY: null,
        // accelerationIncludingGravityZ: null,
        // },
        // rotation: {
        rotationAlpha: null,
        rotationBeta: null,
        rotationGamma: null,
        // },
        // rotationRate: {
        // rotationRateAlpha: null,
        // rotationRateBeta: null,
        // rotationRateGamma: null,
        // },
        orientation: null
      },
      compassData: {
        strike: null,
        dip: null,
        dipdir: null,
        trend: null,
        plunge: null,
        rake: null,
        rake_calculated: 'no'
      },
      toggles: [CompassToggleButtons.PLANAR],
      strikeSpinValue: new Animated.Value(0),
      trendSpinValue: new Animated.Value(0),
      sliderValue: 5,
      showDataModal: false,
      showDeviceMotionModal: true
    };
  }

  // componentWillMount() {
  //   ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT_UP);
  // };

  async componentDidMount() {
    this._isMounted = true;
    // Orientation.lockToPortrait();
    //this allows to check if the system autolock is enabled or not.
    // DeviceMotion.isAvailableAsync();
    console.log('deviceIsAvailable', DeviceMotion.isAvailableAsync());
    DeviceMotion.addListener((deviceMotionData) => {
      // console.log('listener CB', deviceMotionData);
      this.setState(prevState => {
        return {
          ...prevState,
          deviceMotion: {
            // accelerationX: roundToDecimalPlaces(deviceMotionData.acceleration.x, 6),
            // accelerationY: roundToDecimalPlaces(deviceMotionData.acceleration.y,6),
            // accelerationZ: roundToDecimalPlaces(deviceMotionData.acceleration.z,6),
            // accelerationIncludingGravityX: roundToDecimalPlaces(deviceMotionData.accelerationIncludingGravity.x,6),
            // accelerationIncludingGravityY: roundToDecimalPlaces(deviceMotionData.accelerationIncludingGravity.y,6),
            // accelerationIncludingGravityZ: roundToDecimalPlaces(deviceMotionData.accelerationIncludingGravity.z,6),
            rotationAlpha:roundToDecimalPlaces(deviceMotionData.rotation.alpha,6),
            rotationBeta: roundToDecimalPlaces(deviceMotionData.rotation.beta,6),
            rotationGamma: roundToDecimalPlaces(deviceMotionData.rotation.gamma,6),
            // rotationRateAlpha:roundToDecimalPlaces(deviceMotionData.rotationRate.alpha,6),
            // rotationRateBeta: roundToDecimalPlaces(deviceMotionData.rotationRate.beta,6),
            // rotationRateGamma: roundToDecimalPlaces(deviceMotionData.rotationRate.gamma,6),
            orientation: roundToDecimalPlaces(deviceMotionData.orientation, 6),
          }
        }
      })
    });
    // await this.subscribe();
    // RNSimpleCompass.start(degree_update_rate, (degree) => {
    //   // degreeFacing = (<Text>{degree}</Text>);
    //   // console.log('You are facing', degree);
    //   this.setState(prevState => {
    //       return {
    //         ...prevState,
    //         magnetometer: degree
    //       }
    //     },
    //     // () => console.log('magnetometer reading:', this.state.magnetometer)
    //   );
    // });
    // console.log('Compass subscribed');
  };

  async componentWillUnmount() {
    if (this.props.deviceDimensions.width < 500){
      // Orientation.unlockAllOrientations()
    }
    // else Orientation.lockToLandscapeLeft();
    DeviceMotion.removeAllListeners();
    console.log('Listeners removed');
    // await this.unsubscribe();
    // RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  };

  // _onOrientationDidChange = (orientation) => {
  //   if (orientation === 'PORTRAIT') {
  //     console.log('AAAA', orientation)
  //     orientationChange = <Text>{orientation}</Text>
  //     Orientation.lockToLandscapeRight();
  //     this.calculateOrientationLandscape()
  //
  //   } else {
  //     console.log('BBBB', orientation)
  //     orientationChange = <Text>{orientation}</Text>
  //
  //   }
  // };

  grabMeasurements = () => {
    let measurements = [];
    if (this.state.toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.push({
        strike: this.state.compassData.strike,
        dip_direction: this.state.compassData.dipdir,
        dip: this.state.compassData.dip,
        type: 'planar_orientation',
        quality: this.state.sliderValue.toString()
      });
    }
    if (this.state.toggles.includes(CompassToggleButtons.LINEAR)) {
      measurements.push({
        trend: this.state.compassData.trend,
        plunge: this.state.compassData.plunge,
        rake: this.state.compassData.rake,
        rake_calculated: 'yes',
        type: 'linear_orientation',
        quality: this.state.sliderValue.toString()
      });
    }

    if (measurements.length > 0) {
      let newOrientation = measurements[0];
      newOrientation.id = getNewId();
      if (measurements.length > 1) {
        let newAssociatedOrientation = measurements[1];
        newAssociatedOrientation.id = getNewId();
        newOrientation.associated_orientation = [newAssociatedOrientation];
      }
      const orientations = (typeof this.props.spot.properties.orientation_data === 'undefined') ? [newOrientation] : [...this.props.spot.properties.orientation_data, newOrientation];
      this.props.onSpotEdit('orientation_data', orientations);
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  subscribe = async () => {
    let angle = null;
     this._subscription = await accelerometer.subscribe((data) => {
      // console.log(data);
      // angle = this._angle(data);
      this.setState(prevState => {
          return {
            ...prevState,
            accelerometer: {...data}
          }
        },
        () => {
          // console.log('Accelerometer state:', this.state.accelerometer);
          // this.calculateRotationMatrix();
          // this.calculateOrientation();
        });
    });
  };

  unsubscribe = () => {
    //   this._subscription && this._subscription.remove();
    if (this._subscription) this._subscription.unsubscribe();
    this._subscription = null;
  };

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  calculateRotationMatrix = () => {
    const yaw = this.state.deviceMotion.rotationAlpha;
    const pitch = this.state.deviceMotion.rotationBeta;
    const roll = this.state.deviceMotion.rotationGamma;
    const orientation = this.state.deviceMotion.orientation;
    // const r11 = Math.cos(roll) * Math.cos(yaw) - Math.sin(roll) * Math.sin(pitch) * Math.sin(yaw);
    // const r12 = Math.cos(yaw) * Math.sin(roll) * Math.sin(pitch) + Math.cos(roll) * Math.sin(yaw);
    // const r13 = -Math.sin(roll) * Math.cos(pitch);
    const r21 = -Math.cos(pitch) * Math.sin(yaw);
    const r22 = Math.cos(pitch) * Math.cos(yaw);
    const r23 = Math.sin(pitch);
    const r31 = Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw) + Math.cos(yaw) * Math.sin(roll);
    const r32 = Math.sin(yaw) * Math.sin(roll) - Math.cos(roll) * Math.cos(yaw) * Math.sin(pitch);
    const r33 = Math.cos(roll) * Math.cos(pitch);
    const NED_r3x = this.cartesianToSpherical(r32, -r31, -r33);
    const NED_r2x = this.cartesianToSpherical(r22, -r21, -r23);
    const strikeAndDip = this.strikeAndDip(NED_r3x);
    const trendAndPlunge = this.trendAndPlunge(NED_r2x);

     return (
       <View>
         {/*<Text style={{fontSize: 12}}>NED = cartesianToSpherical(r22, r21, r23)</Text>*/}
         {/*<Text>NED_r2x = {NED_r2x[0]}, {NED_r2x[1]}, {NED_r2x[2]}</Text>*/}
         {/*<Text style={{fontSize: 12}}>NED = cartesianToSpherical(r32, r31, r33)</Text>*/}
         {/*<Text>NED_r3x = {NED_r3x[0]}, {NED_r3x[1]}, {NED_r3x[2]}</Text>*/}
         <Text>Yaw = {roundToDecimalPlaces(toDegrees(yaw), 5)}</Text>
         <Text>Pitch = {pitch}</Text>
         <Text>Roll = {roll}</Text>
         <Text>Orientation = {orientation}</Text>
         <Text>Strike = {strikeAndDip[0]}</Text>
         <Text>Dip = {strikeAndDip[1]}</Text>
         <Text>Trend = {trendAndPlunge[0]}</Text>
         <Text>Plunge = {trendAndPlunge[1]}</Text>
       </View>
     )
  };

  strikeAndDip = (NED) => {
    const phi = NED[1];
    const theta = NED[2];
    let strikeDeg = null;
    let dipDeg = null;
    if (phi <= Math.PI/2) {
      strikeDeg = mod(360 - theta * (180/Math.PI), 360);
      dipDeg = phi * (180/Math.PI);
    } else {
      strikeDeg = mod(360 - (theta - Math.PI) * (180/Math.PI), 360);
      dipDeg = (Math.PI - phi) * (180/Math.PI);
    }
    return [roundToDecimalPlaces(strikeDeg,0), roundToDecimalPlaces(dipDeg,0)];
  };

  trendAndPlunge = (NED) => {
    const phi = NED[1];
    const theta = NED[2];
    let trendDeg = mod(90 - theta * (180/Math.PI), 360);
    let plungeDeg = phi * (180/Math.PI) -90;
    if (plungeDeg < 0) {
      trendDeg = mod(trendDeg + 180, 360);
      plungeDeg = -plungeDeg
    }
    return [roundToDecimalPlaces(trendDeg, 2), roundToDecimalPlaces(plungeDeg, 2)];
  };

  cartesianToSpherical = (r1, r2, r3) => {
    let rho = Math.sqrt(Math.pow(r1, 2) + Math.pow(r2, 2) + Math.pow(r3, 2));
    let phi = 0;
    let theta = null;
    if (rho === 0) {
      phi = 0;
      theta = 0;
    } else {
      phi = Math.acos(r3/rho);
      if (rho * Math.sin(phi) === 0) {
        if (r3 >= 0){
          rho = r3;
          phi = 0;
          theta = 0;
        } else {
          rho = -r3;
          phi = Math.PI;
          theta = 0;
        }
      } else {
        theta = Math.atan2(r2, r1)
      }
    }
    return [roundToDecimalPlaces(rho,4), roundToDecimalPlaces(phi,3), roundToDecimalPlaces(theta,3)]
  };

  calculateOrientation = () => {
    const x = this.state.accelerometer.x;
    const y = this.state.accelerometer.y;
    const z = this.state.accelerometer.z;
    let {headingAvgArr} = this.state;

    //let actualHeading = mod(vm.result.magneticHeading + vm.magneticDeclination, 360);
    let actualHeading = mod(this.state.magnetometer - 270, 360);  // ToDo: adjust for declination
    headingAvgArr.push(actualHeading);
    if (headingAvgArr.length > 10) headingAvgArr.shift();
    let sum = headingAvgArr.reduce((prev, current) => current + prev);
    let avgHeading = sum / headingAvgArr.length;
    // console.log('Average', avg);
    // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
    // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
    // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
    // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
    // keyboard, and is positive as it moves up.
    // All results in this section are in radians
    let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let B = Math.acos(Math.abs(y) / s);
    let R = toRadians(90 - toDegrees(B));
    let d = Math.acos(Math.abs(z) / g);
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
    // if (y > 0) trend = diry;
    // if (y > 0) trend = mod(diry, 360);
    else if (y <= 0) trend = mod(diry + 180, 360);
    if (z > 0) trend = mod(trend - 180, 360);
    plunge = toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    this.setState(prevState => {
        return {
          ...prevState,
          compassData: {
            actualHeading: roundToDecimalPlaces(actualHeading, 4),
            strike: roundToDecimalPlaces(strike, 0),
            dipdir: roundToDecimalPlaces(dipdir, 0),
            dip: roundToDecimalPlaces(dip, 0),
            trend: roundToDecimalPlaces(trend, 0),
            plunge: roundToDecimalPlaces(plunge, 0),
            rake: roundToDecimalPlaces(rake, 0),
            rake_calculated: 'yes'
          }
        }
      },
      // () => console.log('Calculated Data:', this.state.compassData)
    );
  };

  // Render the compass
  renderCompass = () => {
    return (
      <TouchableOpacity style={styles.compassImageContainer} onPress={() => this.grabMeasurements()}>
        {/*<Text style={{textAlign: 'center'}}>Tap compass to take a measurement</Text>*/}
        <Image source={require("../../../assets/images/compass/compass.png")}
               style={{
                 marginTop: 25,
                 height: 220,
                 width: 220,
                 justifyContent: 'center',
                 alignItems: 'center',
                 // resizeMode: 'contain',
                 // transform: [{rotate: 360 - this.state.magnetometer + 'deg'}]
               }}
        />
        {this.renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  renderCompassSymbols = () => {
    // console.log('Strike', this.state.compassData.strike + '\n' + 'Trend', this.state.compassData.trend);
    const linearInToggleOn = this.state.toggles.includes(CompassToggleButtons.LINEAR);
    const plannerInToggleOn = this.state.toggles.includes(CompassToggleButtons.PLANAR);

    if (linearInToggleOn && plannerInToggleOn && this.state.compassData.trend !== null && this.state.compassData.strike !== null) {
      return (
        [this.renderTrendSymbol(), this.renderStrikeDipSymbol()]
      );
    }
    else if (linearInToggleOn && this.state.compassData.trend !== null) {
      return this.renderTrendSymbol();

    }
    else if (plannerInToggleOn && this.state.compassData.strike !== null) {
      return this.renderStrikeDipSymbol();
    }

  };

  // Render magnetometer heading, x, y, z from accelerometer and calculated measurements
  renderMeasurements = () => {
    return (
      <View style={styles.measurementsContainer}>
        {/*<Text>heading: {this.state.magnetometer}</Text>*/}
        {/*<Text>x: {this.state.accelerometer.x}</Text>*/}
        {/*<Text>y: {this.state.accelerometer.y}</Text>*/}
        {/*<Text>z: {this.state.accelerometer.z}</Text>*/}
        {
          Object.keys(this.state.compassData).map((key, i) => (
            <Text key={i}>{key}: {this.state.compassData[key]}</Text>
          ))}
      </View>
    );
  };

  renderDeviceMotion = () => {
    const {strike, dip, trend, plunge} = this.state.compassData;
    // return (
    //   Object.keys(this.state.deviceMotion).map((key, i) => (
    //     <Text key={i}>{key}: {this.state.deviceMotion[key]}</Text>
    //   ))
    return (
      <View  style={styles.measurementsContainer}>
        {/*<Text>Yaw = {yaw}</Text>*/}
        {/*<Text>Pitch = {pitch}</Text>*/}
        {/*<Text>Roll = {roll}</Text>*/}
        {/*<Text>Orientation = {orientation}</Text>*/}
        <Text>Strike = {strike}</Text>
        <Text>Dip = {dip}</Text>
        <Text>Trend = {trend}</Text>
        <Text>Plunge = {plunge}</Text>
      </View>
    );

    // return this.state.deviceMotion.map(data => {
    //  return mapKeys(this.state.deviceMotion, (value, key) => {
    //        return (
    //          <Text>key: {key}, value: {value}</Text>
    //        )
    //   });
    //   return (
    //     <View>
    //       <Text>accelerationX: {this.state.deviceMotion.accelerationX}</Text>
    //       <Text>accelerationY: {this.state.deviceMotion.accelerationY}</Text>
    //       <Text>accelerationZ: {this.state.deviceMotion.accelerationZ}</Text>
    //     </View>
    //     // Object.keys(this.state.deviceMotion).map((key, i) => {
    //     // console.log('key', key, 'i', i)
    //     //   return <Text>{}</Text>
    //     // if (typeof this.state.deviceMotion[key] === 'object') {
    //     //   Object.keys(this.state.deviceMotion[key].map(subKey => {
    //     //     return <Text>Hi</Text>
    //     //   })
    //     // )
    //     // }
    //     // else return <Text key={i}>{key} : Ho</Text>
    //   )
  };

  // Render the strike and dip symbol inside the compass
  renderStrikeDipSymbol = () => {
    let image = require("../../../assets/images/compass/StrikeDipCentered.png");
    const spin = this.state.strikeSpinValue.interpolate({
      inputRange: [0, this.state.compassData.strike],
      outputRange: ['0deg', this.state.compassData.strike + 'deg']
    });
// First set up animation
    Animated.timing(
      this.state.strikeSpinValue,
      {
        duration: 300,
        toValue: this.state.compassData.strike,
        easing: Easing.linear(),
        useNativeDriver: true
      }
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [styles.strikeAndDipLine,
            {transform: [{rotate: spin}]}
          ]}/>
    );
  };

  // Render the strike and dip symbol inside the compass
  renderTrendSymbol = () => {
    let image = require("../../../assets/images/compass/TrendLine.png");
    const spin = this.state.trendSpinValue.interpolate({
      inputRange: [0, this.state.compassData.trend],
      outputRange: ['0deg', this.state.compassData.trend + 'deg']
    });
// First set up animation
    Animated.timing(
      this.state.trendSpinValue,
      {
        duration: 300,
        toValue: this.state.compassData.trend,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [styles.trendLine,
            // {transform: [{rotate: this.state.compassData.trend + 'deg'}]}
            {transform: [{rotate: spin}]}
          ]}/>
    );
  };

  renderSlider = () => {
    return (
      <Slider
        // setSliderValue={(value) => this.sliderValueChange(value)}
        onSlidingComplete={(value) =>  this.setState({sliderValue: value}, () => console.log('New Value', value))}
        sliderValue={this.state.sliderValue}
        thumbTouchSize={{width: 80, height: 80}}
        leftText={'Low Quality'}
        rightText={'High Quality'}
      />
    );
  };

  renderToggles = () => {
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
                  style={styles.switch}
                  value={this.state.toggles.includes(CompassToggleButtons[key])}
                  onValueChange={(val) => this.toggleSwitch(CompassToggleButtons[key])}
                  circleSize={25}
                  barHeight={20}
                  circleBorderWidth={3}
                  backgroundActive={'#407ad9'}
                  backgroundInactive={'gray'}
                  circleActiveColor={'#000000'}
                  circleInActiveColor={'#000000'}
                  changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                  innerCircleStyle={{
                    alignItems: "center",
                    justifyContent: "center"
                  }} // style for inner animated circle for what you (may) be rendering inside the circle
                />
              </View>
            </View>}
        />
      ))
    );
  };

  toggleSwitch = (switchType) => {
    const has = this.state.toggles.includes(switchType);
    this.setState(prevState => {
      return {
        ...prevState,
        toggles: has ? prevState.toggles.filter(i => i !== switchType) : prevState.toggles.concat(switchType)
      }
    }, () => console.log('toggles', this.state.toggles));
  };

  viewData = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showDataModal: !prevState.showDataModal
      }
    })
  };

  viewDeviceMotionModal = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showDeviceMotionModal: !prevState.showDeviceMotionModal
      }
    }, () => console.log('Device Motion Modal set to:', this.state.showDeviceMotionModal));

  };

  render() {
    let modalView = null;
    let dataModal =
      <View style={{alignItems: 'center'}}>
        {this.calculateRotationMatrix()}
      </View>;
    let deviceMotionModal =
      <View style={{alignItems: 'flex-start'}}>
        {this.calculateRotationMatrix()}
      </View>;


    if (this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      // Orientation.lockToPortrait();
      if (!isEmpty(this.props.spot)) {
        // console.log('Height', height, 'Width', width)
        modalView =
          <View >
          <View style={height <= 1000 ? {height: 200} : {height: 350}}>
            <Measurements/>
          </View>
          <IconButton
            source={require('../../../assets/icons/NotebookView_pressed.png')}
            style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
            textStyle={{color: themes.BLUE, fontSize: 16, textAlign: 'center'}}
            onPress={() => this.props.onPress(NotebookPages.MEASUREMENT)}
          > Go to {this.props.spot.properties.name}</IconButton>
        </View>
      }
    }
    else if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
      // Orientation.lockToPortrait();
      modalView = <View>
        {this.props.deviceDimensions.width > 700 ? <Button
          title={'View In Shortcut Mode'}
          type={'clear'}
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          onPress={() => this.props.onPress(NotebookPages.MEASUREMENT)}
        /> : null}
        <Button
          title={'Toggle data view'}
          type={'clear'}
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          onPress={() => {
            this.viewData()
          }}
        />
        <Button
          title={'Toggle device motion modal'}
          type={'clear'}
          containerStyle={{margin: 0, padding: 0}}
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          onPress={() => {
            this.viewDeviceMotionModal()
          }}
        />
      </View>
    }

    if (isEmpty(this.props.spot)) {
      return <View style={[styles.samplesContainer, styles.noSpotContent]}>
        <Text style={{fontSize: 30}}>No Spot Selected</Text>
      </View>
    }
    return (
      <View>
      <View style={{flex: 1}}>
        <View style={styles.renderCompassContainer}>
          {/*<View style={{ height: 50, backgroundColor: 'powderblue'}} />*/}
          {this.renderCompass()}
        </View>
        <View style={styles.toggleButtonsRowContainer}>
          {this.renderToggles()}
        </View>
        <View style={styles.sliderContainer}>
          <Text>Current Set Value: {this.state.sliderValue}</Text>
          {this.renderSlider()}
        </View>
      </View>
        <View style={styles.buttonContainer}>
          {modalView}
          {this.state.showDeviceMotionModal && deviceMotionModal}
          {this.state.showDataModal && dataModal}
        </View>
      </View>
    )
  };
}

function mapStateToProps(state) {
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

export default connect(mapStateToProps, mapDispatchToProps)(Compass);
