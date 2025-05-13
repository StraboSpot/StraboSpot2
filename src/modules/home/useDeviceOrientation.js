import RNObject from 'react-native-orientation-director';
import {useToast} from 'react-native-toast-notifications';

const useDeviceOrientation = () => {

  const {convertOrientationToHumanReadableString, getDeviceOrientation, lockTo, unlock} = RNObject;
  const toast = useToast();

  const lockOrientation = () => {
    console.log('Locking device orientation...');
    getDeviceOrientation().then((orientation) => {
      console.log('Current Device Orientation:', convertOrientationToHumanReadableString(orientation));
      lockTo(orientation);
      toast.show('Screen orientation LOCKED');
    });
  };

  const unlockOrientation = () => {
    unlock();
    toast.show('Screen orientation UNLOCKED');
  };

  return {
    lockOrientation: lockOrientation,
    unlockOrientation: unlockOrientation,
  };
};

export default useDeviceOrientation;
