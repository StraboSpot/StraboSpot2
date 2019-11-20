import React, {useState, useEffect, useCallback} from 'react';
import {connect} from "react-redux";
import {
  Animated,
  Switch,
  Easing,
  Alert,
  Image,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter
} from 'react-native';
// import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {getNewId, mod, toRadians, toDegrees, roundToDecimalPlaces, isEmpty} from "../../../shared/Helpers";
import {CompassToggleButtons} from "./Compass.constants";
import {Button, ListItem} from "react-native-elements";
import RNSimpleCompass from 'react-native-simple-compass';
// import {Switch} from "react-native-switch";
import {spotReducers} from "../../../spots/Spot.constants";
import {homeReducers, Modals} from "../../../views/home/Home.constants";
import {NotebookPages, notebookReducers} from "../../notebook-panel/Notebook.constants";

// import Orientation from 'react-native-orientation-locker';
import Slider from '../../../shared/ui/Slider';
// import Measurements from '../Measurements';
// import IconButton from '../../../shared/ui/IconButton';
// Styles
import styles from './CompassStyles';
import * as themes from '../../../shared/styles.constants';
import Measurements from "../Measurements";
import IconButton from "../../../shared/ui/IconButton";

const {height, width} = Dimensions.get('window');

const RNCompass = (props) => {
  let modalView = null;
  const [errorMessage, setErrorMessage] = useState(null);
  const [compassData, setCompassData] = useState({
    strike: null,
    dip: null,
    // dipdir: null,
    trend: null,
    plunge: null,
    //   // rake: null,
    //   // rake_calculated: 'no'
  });
  const [heading, setHeading] = useState(null);
  const [toggles, setToggles] = useState([CompassToggleButtons.PLANAR]);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue, setStrikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue, setTrendSpinValue] = useState(new Animated.Value(0));
  const [showData, setShowData] = useState(false);
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);
  const degree_update_rate = 1; // Number of degrees changed before the callback is triggered

  useEffect(() =>  {
    let isSubscribed = true;
    // console.log(`Is device available: ${DeviceMotion.isAvailableAsync()}`);
    displayCompassData();
    return () => {
      isSubscribed = false;
      NativeModules.Compass.stopObserving();
      console.log(`subscription cancelled`)
    }
  }, []);

  useEffect(() => {
     let isSubscribed = true;
     RNSimpleCompass.start(degree_update_rate, data => {
       const heading = roundToDecimalPlaces(mod(data.degree - 270, 360), 0);
       setHeading(heading);
     });
    return () => {
      isSubscribed = false;
      console.log(`Heading subscription cancelled`)
    }
  }, [RNSimpleCompass]);

  const displayCompassData = () => {
    NativeModules.Compass.myDeviceRotation();
    CompassEvents.addListener('rotationMatrix', res => {
      setCompassData({
        strike: res.strike,
        dip: res.dip,
        trend: res.trend,
        plunge: res.plunge,
      });
    });
  };

  const grabMeasurements = () => {
    let measurements = [];
    if (toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.push({
        strike: compassData.strike,
        // dip_direction: compassData.dipdir,
        dip: compassData.dip,
        type: 'planar_orientation',
        quality: sliderValue.toString()
      });
    }
    if (toggles.includes(CompassToggleButtons.LINEAR)) {
      measurements.push({
        trend: compassData.trend,
        plunge: compassData.plunge,
        rake: compassData.rake,
        rake_calculated: 'yes',
        type: 'linear_orientation',
        quality: sliderValue.toString()
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
      const orientations = (typeof props.spot.properties.orientation_data === 'undefined') ? [newOrientation] : [...props.spot.properties.orientation_data, newOrientation];
      props.onSpotEdit('orientation_data', orientations);
    }
    else Alert.alert('No Measurement Type', 'Please select a measurement type using the toggles.');
  };

  const viewData = () => {
    setShowData(!showData)
  };

  const renderCompass = () => {
    return (
      <TouchableOpacity style={styles.compassImageContainer} onPress={() => grabMeasurements()}>
        <Image source={require("../../../assets/images/compass/compass.png")}
               style={{
                 marginTop: 15,
                 height: 220,
                 width: 220,
                 justifyContent: 'center',
                 alignItems: 'center',
                 // resizeMode: 'contain',
                 // transform: [{rotate: 360 - magnetometer + 'deg'}]
               }}
        />
        {renderCompassSymbols()}
      </TouchableOpacity>
    );
  };

  const renderCompassSymbols = () => {
    // console.log('Strike', compassData.strike + '\n' + 'Trend', compassData.trend);
    const linearInToggleOn = toggles.includes(CompassToggleButtons.LINEAR);
    const plannerInToggleOn = toggles.includes(CompassToggleButtons.PLANAR);

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
    // let text = 'Waiting';
    // if (errorMessage) {
    //   text = errorMessage
    // }
    // else if (compassData.heading) {
    //   text = mod(compassData.heading - 270, 360);
    // }
    // if (compassData === null) {
    //   dataView =
    //     <View style={{alignItems: 'flex-start'}}>
    //       <Text>Spinner</Text>
    //     </View>;
    // }
    // else {
      return (
        <View style={{alignItems: 'flex-start'}}>
          <Text>Heading: {heading}</Text>
          {/*<Text>{text}</Text>*/}
          <Text>Strike: {compassData.strike}</Text>
          <Text>Dip: {compassData.dip}</Text>
          <Text>Trend: {compassData.trend}</Text>
          <Text>Plunge: {compassData.plunge}</Text>
        </View>
      );
    // }
  };

  // Render the strike and dip symbol inside the compass
  const renderStrikeDipSymbol = () => {
    let image = require("../../../assets/images/compass/StrikeDipCentered.png");
    const spin = strikeSpinValue.interpolate({
      inputRange: [0, compassData.strike],
      outputRange: ['0deg', compassData.strike + 'deg']
    });
// First set up animation
    Animated.timing(
      strikeSpinValue,
      {
        duration: 100,
        toValue: compassData.strike,
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

  const renderSlider = () => {
    return (
      <Slider
        onSlidingComplete={(value) => setSliderValue(value)}
        sliderValue={sliderValue}
        thumbTouchSize={{width: 80, height: 80}}
        leftText={'Low'}
        rightText={'High'}
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
                  trackColor={{false: themes.SECONDARY_BACKGROUND_COLOR, true: 'green'}}
                  // ios_backgroundColor={'lightgrey'}
                  onValueChange={() => toggleSwitch(CompassToggleButtons[key])}
                  value={toggles.includes(CompassToggleButtons[key])}
                />
              </View>
            </View>}
        />
      ))
    );
  };

  const toggleSwitch = (switchType) => {
    const has = toggles.includes(switchType);
    console.log(toggles, has);
    setToggles(has ? toggles.filter(i => i !== switchType) : toggles.concat(switchType));
  };

  // Render the strike and dip symbol inside the compass
 const  renderTrendSymbol = () => {
    let image = require("../../../assets/images/compass/TrendLine.png");
    const spin = trendSpinValue.interpolate({
      inputRange: [0, compassData.trend],
      outputRange: ['0deg', compassData.trend + 'deg']
    });
// First set up animation
    Animated.timing(
      trendSpinValue,
      {
        duration: 100,
        toValue: compassData.trend,
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
            // {transform: [{rotate: compassData.trend + 'deg'}]}
            {transform: [{rotate: spin}]}
          ]}/>
    );
  };

 if (props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS){
   if (!isEmpty(props.spot)) {
     modalView =  <View>
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
     </View>;
   }
 } else if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS){
   if (!isEmpty(props.spot)){
     modalView =   <View >
       <View style={height <= 1000 ? {height: 200} : {height: 350}}>
         <Measurements/>
       </View>
       <IconButton
         source={require('../../../assets/icons/StraboIcons_Oct2019/NotebookView_pressed.png')}
         style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
         textStyle={{color: themes.BLUE, fontSize: 16, textAlign: 'center'}}
         onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
       > Go to {props.spot.properties.name}</IconButton>
     </View>
   }
 }

  return (
    <React.Fragment>
      <View style={{flex: 1}}>
        <View >
          <Text style={{textAlign: 'center', fontSize: 12}}>Tap compass to record</Text>
          {/*<View style={{ height: 50, backgroundColor: 'powderblue'}} />*/}
          {renderCompass()}
        </View>
        <View style={styles.toggleButtonsRowContainer}>
          {renderToggles()}
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderHeading}>Quality of Measurement</Text>
          {renderSlider()}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {modalView}
        {/*{showDeviceMotionModal && deviceMotionModal}*/}
        {showData ?  renderDataView(): null}
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
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};
export default connect(mapStateToProps, mapDispatchToProps)(RNCompass);
