import RNSimpleCompass from 'react-native-simple-compass';


const degree_update_rate = 3; // Number of degrees changed before the callback is triggered


import React, {Component} from 'react';
import {Image, View, Text, Dimensions} from 'react-native';
import {Grid, Col, Row} from 'react-native-easy-grid';
import {magnetometer} from 'react-native-sensors'

const {height, width} = Dimensions.get('window');

export default class Compass extends Component {
  _isMounted = false;

  constructor() {
    super();
    this.state = {
      magnetometer: 0
      // magnetometer: {
      //   x: 0,
      //   y: 0,
      //   z: 0,
      //   timestamp: null
      // }
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
      }, () => console.log(this.state.magnetometer))
      // RNSimpleCompass.stop();
    });
  };

  componentWillUnmount() {
    // this._unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  };

//
//   _toggle = () => {
//     if (this._subscription) {
//       this._unsubscribe();
//     } else {
//       this._subscribe();
//     }
//   };
//
//   _subscribe = async () => {
//     let angle = null;
//     this._subscription = magnetometer.subscribe((data) => {
//       console.log(data);
//       angle = this._angle(data);
//       this.setState(prevState => {
//         return {
//           ...prevState,
//           magnetometer: angle
//         }
//       },() => console.log('magnetometer state:', this.state.magnetometer ));
//     });
//   };
//
//   _unsubscribe = () => {
//     this._subscription && this._subscription.remove();
//     this._subscription = null;
//   };
//
//   _angle = (magnetometer) => {
//     if (magnetometer) {
//       let {x, y, z} = magnetometer;
//
//       if (Math.atan2(y, x) >= 0) {
//         angle = Math.atan2(y, x) * (180 / Math.PI);
//       }
//       else {
//         angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
//       }
//     }
//
//     return Math.round(angle);
//   };
//
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

  render() {

    return (

      <View style={{zIndex: -1}}>
         <View>
        <Text>{this.state.magnetometer}</Text>
         </View>
        <Grid style={{backgroundColor: 'lightgrey'}}>


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

          <Row style={{alignItems: 'center'}} size={4}>
            <Text style={{
              color: '#fff',
              fontSize: height / 27,
              width: width,
              position: 'absolute',
              textAlign: 'center'
            }}>
              {this._degree(this.state.magnetometer)}°
            </Text>

            <Col style={{alignItems: 'center', flex: 0}}>

              <Image source={require("../../assets/images/compass/compass_bg.png")} style={{
                height: width - 80,
                justifyContent: 'center',
                alignItems: 'center',
                resizeMode: 'contain',
                transform: [{rotate: 360 - this.state.magnetometer + 'deg'}]
              }}/>

            </Col>
          </Row>
        </Grid>
      </View>
    );
  };
}
