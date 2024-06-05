import {PermissionsAndroid} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import {isEmpty} from '../shared/Helpers';
import alert from '../shared/ui/alert';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

const usePermissions = () => {

  const permissionsRequestType = (permission) => {
    switch (permission) {
      case PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE:
        return {
          title: 'WRITE To External Storage',
          message: 'StraboSpot needs permission access the external storage to save files',
        };
      case PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE:
        return {
          title: 'READ External Storage',
          message: 'StraboSpot needs permission access the external storage to read files',
        };
      case PermissionsAndroid.PERMISSIONS.CAMERA:
        return {
          title: 'CAMERA',
          message: 'StraboSpot needs permission to use the camera take pictures',
        };
    }
  };

  const checkPermission = async (permission) => {
    let granted;
    let deviceVersion = DeviceInfo.getSystemVersion();

    // No Longer need to request permission for Android 13+
    if ((permission === PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        || permission === PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
      && deviceVersion >= 13) {
      return PermissionsAndroid.RESULTS.GRANTED;
    }

    granted = await PermissionsAndroid.check(permission);
    if (granted) return PermissionsAndroid.RESULTS.GRANTED;
    else granted = await requestPermission(permission);
    console.log('Permissions', granted);
    return granted;
  };

  const checkIOSPermission = async () => {
    return check(PERMISSIONS.IOS.CAMERA)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)');
            return false;
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable');
            return false;
          case RESULTS.LIMITED:
            console.log('The permission is limited: some actions are possible');
            return false;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            return true;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            return false;
        }
      })
      .catch((error) => {
        // …
      });
  };

  const requestPermission = async (permission) => {
    const useRational = {
      ...permissionsRequestType(permission),
      buttonPositive: 'OK',
    };
    const result = await PermissionsAndroid.request(permission, useRational);
    console.log('RESULT', result);
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return PermissionsAndroid.RESULTS.GRANTED;
    }
    else {
      alert('Permission Denied',
        'You may have denied this permission previously. \nTo allow permission please go to Settings -> App -> StraboSpot2 -> Permissions');
    }
  };

  const requestPermissions = async (permissions) => {
    if (Array.isArray(permissions) && !isEmpty(permissions)) {
      return await PermissionsAndroid.requestMultiple(permissions);
    }
    else throw Error('permissions is not of type array');
  };

  return {
    checkPermission: checkPermission,
    checkIOSPermission: checkIOSPermission,
    requestPermission: requestPermission,
    requestPermissions: requestPermissions,
  };
};

export default usePermissions;
