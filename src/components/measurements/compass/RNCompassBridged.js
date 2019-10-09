import React, {useState, useEffect} from 'react';
import {Button, Text, View, NativeModules, NativeEventEmitter, Animated} from 'react-native';
import {CompassToggleButtons} from "./Compass.constants";

const RNCompassBridged = props => {
  const [count, setCount] = useState(0);
  const [accelerometer, setAccelerometer] = useState({
    accelerationX: 0,
    accelerationY: 0,
    accelerationZ: 0,
  });
  const [compassData, setCompassData] = useState({
    strike: 0,
    dip: 0,
    trend: 0,
    plunge: 0,
  });
  const [toggles, setToggles] = useState([CompassToggleButtons.PLANAR]);
  const [sliderValue, setSliderValue] = useState(5);
  const [strikeSpinValue, setStrikeSpinValue] = useState(new Animated.Value(0));
  const [trendSpinValue, setTrendSpinValue] = useState(new Animated.Value(0));
  const [showData, setShowData] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);


  useEffect(() => {
    console.log('UPDATED RENDER!');
    // CompassEvents.addListener('onIncrement', res => {
    //     setCount(res.count);
    //     console.log('onIncrement event', res.count);
    //     // console.log('Compass Native Module', NativeModules.Compass);
    //   },
    // );
    // CompassEvents.addListener('acceleration', res => {
    //     // setCount(res);
    //     console.log('acceleration event', res);
    //     // console.log('Compass Native Module', NativeModules.Compass);
    //   },
    // );
  }, []);

  // NativeModules.Compass.getCount((first, ...others) => {
  //   // console.log('count is: ', first);
  //   // console.log('other arguments ', others);
  // });

  // NativeModules.Compass.getCount(value => {
  //   console.log('count is ' + value);
  // });

  const getCount = () => {
    NativeModules.Compass.getCount(value => {
      // console.log('count is ' + value);
      setCount(value);
    });
    return <Text>{count}</Text>;
  };

  const getAcceleration = () => {
    // eslint-disable-next-line no-shadow
    // const increment = NativeModules.Compass.increment();
    NativeModules.Compass.myAccelermoter();
    CompassEvents.addListener('acceleration', res => {
        // setCount(res);
        console.log('acceleration event', res);
        setAccelerometer(res);
        // console.log('Compass Native Module', NativeModules.Compass);
      },
    );
    // console.table(accelerometerData);
    // setCount(increment);
    setError(false);
  };

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

  // Uses standard Promise (resolve/reject)
  // NativeModules.Compass.decrement()
  //   .then(res => {
  //     // console.log(res);
  //     setCount(res);
  //     setError(false);
  //   })
  //   .catch(e => {
  //     // console.log(e.message, e.code);
  //     setError(true);
  //     setErrorMessage(e.message);
  //   });
  // };

  const stopEvents = () => {
    NativeModules.Compass.stopObserving();
  };

  const clearEvents = () => {
    setCompassData({
      strike: 0,
      dip: 0,
      trend: 0,
      plunge: 0,
    });
    setAccelerometer({
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: 0,
    });
  };

  return (
    <React.Fragment>
      <View style={{backgroundColor: 'white', padding: 25}}>
        <Text style={{fontSize: 18}}>
          AccelerationX: {accelerometer.accelerationX}
        </Text>
        <Text style={{fontSize: 18}}>
          AccelerationY: {accelerometer.accelerationY}
        </Text>
        <Text style={{fontSize: 18}}>
          AccelerationZ: {accelerometer.accelerationZ}
        </Text>
        <Text>--------------------------------------</Text>
        <Text style={{fontSize: 18}}>
          Strike: {compassData.strike}</Text>
        <Text style={{fontSize: 18}}>
          Dip: {compassData.dip}
        </Text>
        <Text style={{fontSize: 18}}>
          Trend: {compassData.trend}
        </Text>
        <Text style={{fontSize: 18}}>
          Plunge: {compassData.plunge}
        </Text>
        {/*<Text style={{textAlign: 'center'}}>{error ? errorMessage : null}</Text>*/}
      </View>
      <View style={{ marginTop: 35}}>
        <Button
          title={'Start Accelerometer'}
          type={'solid'}
          onPress={() => getAcceleration()}
        />
        <Button
          title={'Start Compass Data'}
          type={'solid'}
          onPress={() => displayCompassData()}
        />
      </View>
      {/*<Button title={'Decrement'} type={'solid'} onPress={() => decrementCount()}/>*/}
      <Button title={'Stop All'} type={'solid'} onPress={() => stopEvents()}/>
      <Button title={'Clear'} type={'solid'} onPress={() => clearEvents()}/>
      {/*<Text style={{textAlign: 'center'}}>Count: {getCount()}</Text>*/}
    </React.Fragment>
  );
};

export default RNCompassBridged;
