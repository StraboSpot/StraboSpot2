import RNOrientationDirector,  {Orientation} from 'react-native-orientation-director';
import {useToast} from 'react-native-toast-notifications';

const useDeviceOrientation = () => {

  const toast = useToast();

  const lockOrientation = () => {
    console.log('Locking device orientation...');
    RNOrientationDirector.getDeviceOrientation().then((orientation) => {
      console.log('Current Device Orientation:', RNOrientationDirector.convertOrientationToHumanReadableString(orientation));
      RNOrientationDirector.lockTo(orientation, Orientation.landscape);
      toast.show('Screen orientation LOCKED');
    });
  };

  const unlockOrientation = () => {
    RNOrientationDirector.unlock();
    toast.show('Screen orientation UNLOCKED');
  };

  return {
    lockOrientation: lockOrientation,
    unlockOrientation: unlockOrientation,
  };
};

export default useDeviceOrientation;
