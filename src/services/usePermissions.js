import {useState} from 'react';
import {PermissionsAndroid} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import {useToast} from 'react-native-toast-notifications';

import {isEmpty} from '../shared/Helpers';
import alert from '../shared/ui/alert';

const {RESULTS, PERMISSIONS, request, check} = PermissionsAndroid;

const usePermissions = () => {

  const toast = useToast();

  const permissionsRequestType = (permission) => {
    switch (permission) {
      case PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE:
        return {
          title: 'EXTERNAL STORAGE',
          message: 'StraboSpot needs permission access the external storage to save files',
        };
      case PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE:
        return {
          title: 'EXTERNAL STORAGE',
          message: 'StraboSpot needs permission access the external storage to read files',
        };
      case PermissionsAndroid.PERMISSIONS.CAMERA:
        return  {
          title: 'CAMERA',
          message: 'StraboSpot needs permission to use the camera take pictures',
        };
    }
  };

  const [granted, setGranted] = useState(false);

  const checkPermission = async (permission) => {
    let deviceVersion = DeviceInfo.getSystemVersion();
    if (deviceVersion >= 13) return true;
    const res = await permittingCheck(PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    console.log(res);
  };

  const permittingCheck = (data) => {
    return new Promise((resolve, reject) => {
      check(data)
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              resolve(false);
              break;
            case RESULTS.DENIED:
              resolve(false);
              break;
            case RESULTS.LIMITED:
              resolve(false);
              break;
            case RESULTS.GRANTED:
              resolve(true);
              break;
            case RESULTS.BLOCKED:
              resolve(false);
              break;
          }
        })
        .catch((error) => {
          console.error('ERROR permittingCheck()', error);
          resolve(false);
        });
    });
  };

  const permittingReq = (data) => {
    return new Promise((resolve, reject) => {
      request(data)
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              resolve(false);
              break;
            case RESULTS.DENIED:
              resolve(false);
              break;
            case RESULTS.LIMITED:
              resolve(false);
              break;
            case RESULTS.GRANTED:
              resolve(true);
              break;
            case RESULTS.BLOCKED:
              resolve(false);
              break;
          }
        })
        .catch((error) => {
          console.error('ERROR permittingReq()', error);
          resolve(false);
        });
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
      return true;
    }
    else alert('Permission Denied', 'To allow permission please go to Settings -> App -> StraboSpot2 -> Permissions');
  };

  const requestPermissions = async (permissions) => {
    if (Array.isArray(permissions) && !isEmpty(permissions)) {
      return await PermissionsAndroid.requestMultiple(permissions);
    }
    else throw Error('permissions is not of type array');
  };

  const requestWritePermission = async () => {
    let deviceVersion = DeviceInfo.getSystemVersion();
    if (deviceVersion >= 13) return true;
    const res = await permittingCheck(PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    console.log(res);
  };

  const requestReadPermission = async () => {
    let deviceVersion = DeviceInfo.getSystemVersion();
    if (deviceVersion >= 13) return true;
    const res = await permittingReq(PERMISSIONS.READ_EXTERNAL_STORAGE);
    console.log(res);
  };

  return {
    checkPermission: checkPermission,
    requestPermission: requestPermission,
    requestPermissions: requestPermissions,
    requestReadPermission: requestReadPermission,
    requestWritePermission: requestWritePermission,
  };
};

export default usePermissions;
