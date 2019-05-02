import RNSimpleCompass from 'react-native-simple-compass';


const degree_update_rate = 2; // Number of degrees changed before the callback is triggered


import React, {Component} from 'react';
import {Image, View, Text, Dimensions} from 'react-native';
import {Grid, Col, Row} from 'react-native-easy-grid';
import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {mod, toRadians, toDegrees, roundToDecimalPlaces} from "../../shared/Helpers";

const {height, width} = Dimensions.get('window');

export default class Compass extends Component {
  _isMounted = false;

  constructor() {
    super();

    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);

    this.state = {
      magnetometer: 0,
      accelerometer: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: null
      },
      subscriptions: {
        accelerometer: null
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

    };
  }

  // componentWillMount() {
  //   ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT_UP);
  // };

  componentDidMount() {
    this._isMounted = true;
    // this._toggle();
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      console.log('You are facing', degree);
      this.setState(prevState => {
        return {
          ...prevState,
          magnetometer: degree
        }
      }, () => console.log('magnetometer reading:', this.state.magnetometer));
      // RNSimpleCompass.stop();
    });
  };

  componentWillUnmount() {
    this.unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  };

  toggle = () => {
    if (this._subscription) {
      this.unsubscribe();
    }
    else {
      this.subscribe();
    }
  };

  subscribe = async () => {
    let angle = null;
    this._subscription = accelerometer.subscribe((data) => {
      // console.log(data);
      // angle = this._angle(data);
      this.setState(prevState => {
          return {
            ...prevState,
            accelerometer: {...data}
          }
        },
        () => {
          console.log('Accelerometer state:', this.state.accelerometer);
          this.calculateOrientation();
        });
    });
  };

  unsubscribe = () => {
    //   this._subscription && this._subscription.remove();
    if (this._subscription) this._subscription.unsubscribe();
    this._subscription = null;
    console.log('Unsubscribed');
  };

  /*  _angle = (magnetometer) => {
      let angle = null;
      if (magnetometer) {
        let {x, y, z} = magnetometer;

        if (Math.atan2(y, x) >= 0) {
          angle = Math.atan2(y, x) * (180 / Math.PI);
        }
        else {
          angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
        }
      }

      return Math.round(angle);
    };*/

  _direction = (degree) => {
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

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  calculateOrientation = () => {
    const x = this.state.accelerometer.x;
    const y = this.state.accelerometer.y;
    const z = this.state.accelerometer.z;
    //let actualHeading = mod(vm.result.magneticHeading + vm.magneticDeclination, 360);
    let actualHeading = mod(this.state.magnetometer, 360);  // ToDo: adjust for declination

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
    dipdir = mod(dipdir, 360);
    strike = mod(dipdir - 90, 360);
    dip = toDegrees(d);

    // Calculate trend, plunge and rake (in degrees)
    let trend, plunge, rake;
    if (y > 0) trend = mod(diry + 180, 360);
    if (y <= 0) trend = diry;
    plunge = toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    /*    if (vmParent.data.type === 'linear_orientation') {
          vm.compassData.trend = roundToDecimalPlaces(trend, 0);
          vm.compassData.plunge = roundToDecimalPlaces(plunge, 0);
          vm.compassData.rake = roundToDecimalPlaces(rake, 0);
          vm.compassData.rake_calculated = 'yes';
        }
        else {
          vm.compassData.strike = roundToDecimalPlaces(strike, 0);
          vm.compassData.dipdir = roundToDecimalPlaces(dipdir, 0);
          vm.compassData.dip = roundToDecimalPlaces(dip, 0);
        }*/

    this.setState(prevState => {
        return {
          ...prevState,
          compassData: {
            ...prevState.compassData,
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
      () => console.log('Calculated Data:', this.state.compassData));
  };

  render() {

    return (

      <View style={{zIndex: 0}}>
        <View>
          <Text style={{
            color: '#fff',
            fontSize: height / 29,
            width: width,
            position: 'absolute',
            textAlign: 'center',
            paddingRight: 200
          }}>
            {this._degree(this.state.magnetometer).toFixed(2)}°
          </Text>
        </View>
        <Grid style={{backgroundColor: 'transparent', width: 500, height: 300}}>

          <Col>
            <Row style={{alignItems: 'center', flex: 0}} size={.5}>
              <Col style={{alignItems: 'center'}}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: height / 26,
                    fontWeight: 'bold'
                  }}>{this._direction(this._degree(this.state.magnetometer))}
                </Text>
              </Col>
            </Row>

            <Row style={{alignItems: 'center'}} size={.1}>
              <Col style={{alignItems: 'center'}}>
                <View style={{position: 'absolute', width: width, alignItems: 'center', top: 0}}>
                  <Image source={require('../../assets/images/compass/compass_pointer.png')} style={{
                    height: height / 26,
                    resizeMode: 'contain'
                  }}/>
                </View>
              </Col>
            </Row>

            <Row style={{alignItems: 'center'}} size={4} onPress={() => this.toggle()}>
              {/*<Text style={{*/}
              {/*  color: '#fff',*/}
              {/*  fontSize: height / 29,*/}
              {/*  width: width,*/}
              {/*  position: 'absolute',*/}
              {/*  textAlign: 'center',*/}
              {/*}}>*/}
              {/*  {this._degree(this.state.magnetometer)}°*/}
              {/*</Text>*/}

              <View style={{alignItems: 'center', flex: 1, paddingTop: 70}}>
                <Image source={require("../../assets/images/compass/compass.png")} style={{
                  height: 250,
                  justifyContent: 'center',
                  alignItems: 'center',
                  resizeMode: 'contain',
                  transform: [{rotate: 90 - this.state.magnetometer + 'deg'}]
                }}/>
                <Image source={require("../../assets/images/compass/StrikeDip.png")} style={{
                  height: 150,
                  position: 'absolute',
                  top: 120,
                  // justifyContent: 'center',
                  // alignItems: 'center',
                  resizeMode: 'contain',
                  transform: [{rotate: 180 - this.state.magnetometer + 'deg'}]
                }}/>
              </View>
            </Row>

          </Col>
          <Col>
            <Row style={{flexDirection: 'column'}}>
              <Text>x: {this.state.accelerometer.x}</Text>
              <Text>y: {this.state.accelerometer.y}</Text>
              <Text>z: {this.state.accelerometer.z}</Text>
            </Row>
            <Row style={{flexDirection: 'column'}}>
              <Text>strike: {this.state.compassData.strike}</Text>
              <Text>dip: {this.state.compassData.dip}</Text>
              <Text>dipdir: {this.state.compassData.dipdir}</Text>
              <Text>trend: {this.state.compassData.trend}</Text>
              <Text>plunge: {this.state.compassData.plunge}</Text>
              <Text>rake: {this.state.compassData.rake}</Text>
              <Text>rake_calculated: {this.state.compassData.rake_calculated}</Text>
            </Row>
          </Col>

        </Grid>
      </View>
    );
  };
}
