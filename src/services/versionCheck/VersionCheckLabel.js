import React, {useEffect, useState} from 'react';
import {Linking, Platform, Pressable, Text, View} from 'react-native';

import {checkVersion} from 'react-native-check-version';
import DeviceInfo from 'react-native-device-info';
import VersionCheckHook from '../versionCheck/useVersionCheck';

import styles from './versionCheck.styles';

const VersionCheckLabel = (props) => {
  const [versionObj, setVersionObj] = useState({});
  const [deviceVersion, setDeviceVersion] = useState('');

  const useVersionCheck = VersionCheckHook();

  useEffect(() => {
    // if (Platform.OS === 'ios') {
    useVersionCheck.checkAppStoreVersion().then((res) => {
      setVersionObj(res.versionObj);
      setDeviceVersion(res.deviceVersion);
    });
    // }
  }, []);

  // const checkAppStoreVersion = async () => {
  //   console.log('Got device version:', DeviceInfo.getVersion());
  //   setDeviceVersion(DeviceInfo.getVersion);
  //   console.log('Got device bundleId:', DeviceInfo.getBundleId());
  //   console.log('Got device type:', DeviceInfo.getDeviceType());
  //
  //   const version = await checkVersion();
  //   setVersionObj(version);
  //   console.log('Got version info:', version);
  //
  //   if (version.needsUpdate) {
  //     console.log(`App has a ${version.updateType} update pending.`);
  //     setNeedsUpdate(version.needsUpdate);
  //   }
  // };

  const handlePress = async () => {
    const res = await Linking.canOpenURL(versionObj.url);
    if (res) await Linking.openURL(versionObj.url);
  };

  return (
    <Pressable style={styles.container} onPress={() => handlePress()}>
      {versionObj.needsUpdate && (
        <View style={styles.twelvePointBurstContainer}>
          <View style={styles.twelvePointBurstMain}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Update Available!</Text>
              <View>
                <Text style={styles.versionText}>{versionObj.version}</Text>
                <Text style={styles.text}>
                  is available in the{' '}
                  {Platform.OS === 'ios' ? 'AppStore' : 'PlayStore'}
                </Text>
                <Text style={{...styles.text, fontSize: 10}}>
                  Press to go to{' '}
                  {Platform.OS === 'ios' ? 'AppStore' : 'PlayStore'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.twelvePointBurst30} />
          <View style={styles.twelvePointBurst60} />
        </View>
      )}
    </Pressable>
  );
};

export default VersionCheckLabel;
