import {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {isEmpty} from '../shared/Helpers';

const usePermissions = () => {

  const [granted, setGranted] = useState({});

  const checkPermission = async (permission) => {
     return await PermissionsAndroid.check(permission);
  };

  const requestPermission = async (permission) => {
    const cameraUseRational = {
        title: 'StraboSpot Camera Permission',
        message:
          'StraboSpot needs access to your camera so you can take pictures.',
        buttonPositive: 'OK',
      };
    return await PermissionsAndroid.request(permission, cameraUseRational);
  }

  const requestPermissions = async (permissions) => {
    if (Array.isArray(permissions) && !isEmpty(permissions)) {
      return await PermissionsAndroid.requestMultiple(permissions);
    }
    else throw Error('permissions is not of type array');
  };

  return {
    checkPermission: checkPermission,
    requestPermission: requestPermission,
    requestPermissions: requestPermissions,
  };
};

export default usePermissions;
