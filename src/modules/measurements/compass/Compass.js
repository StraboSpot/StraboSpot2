import React, {Component} from 'react';
import {Animated, Easing, Alert, Image, View, Text, TouchableOpacity} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {setUpdateIntervalForType, SensorTypes, accelerometer} from 'react-native-sensors';
import RNSimpleCompass from 'react-native-simple-compass';
import {Switch} from 'react-native-switch';
import {connect} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {getNewId, mod, toRadians, toDegrees, roundToDecimalPlaces, isEmpty} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
import IconButton from '../../../shared/ui/IconButton';
import Slider from '../../../shared/ui/Slider';
import uiStyles from '../../../shared/ui/ui.styles';
import {homeReducers, Modals} from '../../home/home.constants';
import {NotebookPages, notebookReducers} from '../../notebook-panel/notebook.constants';
import {spotReducers} from '../../spots/spot.constants';
import Measurements from '../Measurements';
import {CompassToggleButtons} from './compass.constants';
import styles from './compass.styles';

const Sound = require('react-native-sound');

const ButtonClick = new Sound('ButtonClick.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  console.log(
    'duration in seconds: ' + ButtonClick.getDuration() + ' number of channels: ' + ButtonClick.getNumberOfChannels());
});

const degree_update_rate = 2; // Number of degrees changed before the callback is triggered

class Compass extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    setUpdateIntervalForType(SensorTypes.accelerometer, 300);
    setUpdateIntervalForType(SensorTypes.magnetometer, 300);

    this.state = {
      magnetometer: 0,
      accelerometer: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: null,
      },
      subscriptions: {
        accelerometer: null,
      },
      compassData: {
        strike: null,
        dip: null,
        dipdir: null,
        trend: null,
        plunge: null,
        rake: null,
        rake_calculated: 'no',
      },
      toggles: props.compassMeasurementTypes,
      spinValue: new Animated.Value(0),
      sliderValue: 5,
      showDataModal: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.subscribe();
    RNSimpleCompass.start(degree_update_rate, ({degree, accuracy}) => {
      // degreeFacing = (<Text>{degree}</Text>);
      console.log('You are facing', degree);
      this.setState(prevState => {
          return {
            ...prevState,
            magnetometer: degree,
          };
        },
      );
    });
    console.log('Compass subscribed');
  }

  async componentWillUnmount() {
    await this.unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  }

  grabMeasurements = () => {
    let measurements = [];
    if (this.state.toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.push({
        strike: this.state.compassData.strike,
        dip_direction: this.state.compassData.dipdir,
        dip: this.state.compassData.dip,
        type: 'planar_orientation',
        quality: this.state.sliderValue.toString(),
      });
    }
    if (this.state.toggles.includes(CompassToggleButtons.LINEAR)) {
      measurements.push({
        trend: this.state.compassData.trend,
        plunge: this.state.compassData.plunge,
        rake: this.state.compassData.rake,
        rake_calculated: 'yes',
        type: 'linear_orientation',
        quality: this.state.sliderValue.toString(),
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
      this.playSound();
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  playSound = () => {
    ButtonClick.play(success => {
      if (success) console.log('successfully finished playing');
      else console.log('playback failed due to audio decoding errors');
    });
  };

  subscribe = async () => {
    this._subscription = await accelerometer.subscribe((data) => {
      this.setState(prevState => {
          return {
            ...prevState,
            accelerometer: {...data},
          };
        },
        () => {
          this.calculateOrientation();
        });
    });
  };

  unsubscribe = () => {
    if (this._subscription) this._subscription.unsubscribe();
    this._subscription = null;
  };

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  calculateOrientation = () => {
    const x = this.state.accelerometer.x;
    const y = this.state.accelerometer.y;
    const z = this.state.accelerometer.z;
    let actualHeading = mod(this.state.magnetometer - 270, 360);  // ToDo: adjust for declination

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
            rake_calculated: 'yes',
          },
        };
      },
    );
  };

  // calculateOrientationLandscape = (orientation) => {
  //   // console.log('Orientation', orientation);
  //   const x = this.state.accelerometer.x;
  //   const y = this.state.accelerometer.y;
  //   const z = this.state.accelerometer.z;
  //   //let actualHeading = mod(vm.result.magneticHeading + vm.magneticDeclination, 360);
  //   let actualHeading = mod(this.state.magnetometer - 90, 360);  // ToDo: adjust for declination
  //
  //   // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
  //   // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
  //   // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
  //   // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
  //   // keyboard, and is positive as it moves up.
  //   // All results in this section are in radians
  //   let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  //   let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  //   let B = Math.acos(Math.abs(y) / s);
  //   let R = toRadians(90 - toDegrees(B));
  //   let d = Math.acos(Math.abs(z) / g);
  //   let b = Math.atan(Math.tan(R) * Math.cos(d));
  //
  //   // Calculate dip direction, strike and dip (in degrees)
  //   let dipdir, strike, dip;
  //   let diry = actualHeading;
  //   if (x === 0 && y === 0) {
  //     d = 0;
  //     dipdir = 180;
  //   }
  //   else if (x >= 0 && y >= 0) dipdir = diry - 90 - toDegrees(b);
  //   else if (y <= 0 && x >= 0) dipdir = diry - 90 + toDegrees(b);
  //   else if (y <= 0 && x <= 0) dipdir = diry + 90 - toDegrees(b);
  //   else if (x <= 0 && y >= 0) dipdir = diry + 90 + toDegrees(b);
  //
  //   if (z > 0) dipdir = mod(dipdir, 360);
  //   else if (z < 0) dipdir = mod(dipdir - 180, 360);
  //
  //   strike = mod(dipdir, 360);
  //   dip = toDegrees(d);
  //
  //   // Calculate trend, plunge and rake (in degrees)
  //   let trend, plunge, rake;
  //   if (y > 0) trend = mod(diry - 90, 360); //<---- This is what changed with trend
  //   // if (y > 0) trend = diry;
  //   // if (y > 0) trend = mod(diry, 360);
  //   else if (y <= 0) trend = mod(diry - 90, 360);
  //   if (z > 0) trend = mod(trend - 180, 360);
  //   plunge = toDegrees(Math.asin(Math.abs(y) / g));
  //   rake = toDegrees(R);
  //
  //   this.setState(prevState => {
  //       return {
  //         ...prevState,
  //         compassData: {
  //           actualHeading: roundToDecimalPlaces(actualHeading, 4),
  //           strike: roundToDecimalPlaces(strike, 0),
  //           dipdir: roundToDecimalPlaces(dipdir, 0),
  //           dip: roundToDecimalPlaces(dip, 0),
  //           trend: roundToDecimalPlaces(trend, 0),
  //           plunge: roundToDecimalPlaces(plunge, 0),
  //           rake: roundToDecimalPlaces(rake, 0),
  //           rake_calculated: 'yes',
  //         },
  //       };
  //     },
  //     // () => console.log('Calculated Data:', this.state.compassData)
  //   );
  // };

  // Render the compass
  renderCompass = () => {
    return (
      <TouchableOpacity style={styles.compassImageContainer} onPress={() => this.grabMeasurements()}>
        <Image source={require('../../../assets/images/compass/compass.png')}
               style={{
                 marginTop: 25,
                 height: 220,
                 width: 220,
                 justifyContent: 'center',
                 alignItems: 'center',
               }}
        />
        {this.renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  renderCompassSymbols = () => {
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
        <Text>x: {this.state.accelerometer.x}</Text>
        <Text>y: {this.state.accelerometer.y}</Text>
        <Text>z: {this.state.accelerometer.z}</Text>
        {
          Object.keys(this.state.compassData).map((key, i) => (
            <Text key={i}>{key}: {this.state.compassData[key]}</Text>
          ))}
      </View>
    );
  };

  // Render the strike and dip symbol inside the compass
  renderStrikeDipSymbol = () => {
    let image = require('../../../assets/images/compass/strike-dip-centered.png');
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, this.state.compassData.strike],
      outputRange: ['0deg', this.state.compassData.strike + 'deg'],
    });
    // First set up animation
    Animated.timing(
      this.state.spinValue,
      {
        toValue: this.state.compassData.strike,
        easing: Easing.linear(),
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [styles.strikeAndDipLine,
            {transform: [{rotate: spin}]},
          ]}/>
    );
  };

  // Render the strike and dip symbol inside the compass
  renderTrendSymbol = () => {
    let image = require('../../../assets/images/compass/trendLine.png');
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 360],
      outputRange: [this.state.compassData.trend + 'deg', this.state.compassData.trend + 'deg'],
    });
    // First set up animation
    Animated.timing(
      this.state.spinValue,
      {
        toValue: this.state.spinValue,
        easing: Easing.linear,
        useNativeDriver: true,
      },
    ).start();

    return (
      <Animated.Image
        key={image}
        source={image}
        style={
          [styles.trendLine,
            {transform: [{rotate: spin}]},
          ]}/>
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
                    alignItems: 'center',
                    justifyContent: 'center',
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
        toggles: has ? prevState.toggles.filter(i => i !== switchType) : prevState.toggles.concat(switchType),
      };
    }, () => console.log('toggles', this.state.toggles));
  };

  viewData = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showDataModal: !prevState.showDataModal,
      };
    });
  };

  render() {
    let modalView = null;
    let dataModal =
      <View style={uiStyles.alignItemsToCenter}>
        {this.renderMeasurements()}
      </View>;


    if (this.props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      if (!isEmpty(this.props.spot)) {
        modalView = <View>
          <View style={{height: 320}}>
            <Measurements/>
          </View>
          <IconButton
            source={require('../../../assets/icons/NotebookView_pressed.png')}
            style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
            textStyle={{color: themes.BLUE, fontSize: 16, textAlign: 'center'}}
            onPress={() => this.props.onPress(NotebookPages.MEASUREMENT)}
          > Go to {this.props.spot.properties.name}</IconButton>
        </View>;
      }
    }
    else if (this.props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS) {
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
            this.viewData();
          }}
        />
      </View>;
    }

    if (isEmpty(this.props.spot)) {
      return <View style={[styles.samplesContainer, commonStyles.noContentContainer]}>
        <Text style={commonStyles.noContentText}>No Spot Selected</Text>
      </View>;
    }
    return (
      <View style={{flex: 1}}>
        <Text style={{textAlign: 'center'}}>Tap compass to take a measurement</Text>
        <View style={styles.renderCompassContainer}>
          {this.renderCompass()}
        </View>
        <View style={styles.toggleButtonsRowContainer}>
          {this.renderToggles()}
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            setSliderValue={(value) => this.setState({sliderValue: value})}
            sliderValue={this.state.sliderValue}
            leftText={'Low Quality'}
            rightText={'High Quality'}
          />
        </View>
        <View style={styles.buttonContainer}>
          {modalView}
          {this.state.showDataModal ? dataModal : null}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    compassMeasurementTypes: state.notebook.compassMeasurementTypes,
  };
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Compass);
