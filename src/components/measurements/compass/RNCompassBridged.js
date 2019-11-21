import React, {useState, useEffect} from 'react';
import {Button, Text, View, NativeModules, NativeEventEmitter} from 'react-native';

const RNCompassBridged = props => {
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
  const CompassEvents = new NativeEventEmitter(NativeModules.Compass);

  useEffect(() => {
    console.log('UPDATED RENDER!');
  }, []);

  const getAcceleration = () => {
    // const increment = NativeModules.Compass.increment();
    NativeModules.Compass.myAccelermoter();
    CompassEvents.addListener('acceleration', res => {
        console.log('acceleration event', res);
        setAccelerometer(res);
      },
    );
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
      </View>
      <View style={{marginTop: 35}}>
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
      <Button title={'Stop All'} type={'solid'} onPress={() => stopEvents()}/>
      <Button title={'Clear'} type={'solid'} onPress={() => clearEvents()}/>
    </React.Fragment>
  );
};

export default RNCompassBridged;
