import React from 'react';
import {Text, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {checkVersion} from 'react-native-check-version';

const useVersionCheck = (props) => {
  const checkAppStoreVersion = async () => {
    console.log('Got device version:', DeviceInfo.getVersion());
    const deviceVersion = DeviceInfo.getVersion;
    console.log('Got device bundleId:', DeviceInfo.getBundleId());
    console.log('Got device type:', DeviceInfo.getDeviceType());

    const version = await checkVersion();
    console.log('Got version info:', version);

    // if (version.needsUpdate) {
    //   console.log(`App has a ${version.updateType} update pending.`);
    //   setNeedsUpdate(version.needsUpdate);
    // }
    return {
      deviceVersion: deviceVersion,
      versionObj: version,
    };
  };

  return {
    checkAppStoreVersion: checkAppStoreVersion,
  };
};

export default useVersionCheck;
