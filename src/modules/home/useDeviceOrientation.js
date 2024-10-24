import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT,
  PORTRAIT_UPSIDE_DOWN,
} from 'react-native-orientation-locker';
import {useToast} from 'react-native-toast-notifications';

const useDeviceOrientation = () => {

  const toast = useToast();

  const lockOrientation = () => {
    console.log('Locking device orientation...');
    Orientation.getDeviceOrientation((deviceOrientation) => {
      console.log('Current Device Orientation: ', deviceOrientation);
      if (deviceOrientation === PORTRAIT || deviceOrientation === PORTRAIT_UPSIDE_DOWN) Orientation.lockToPortrait();
      else if (deviceOrientation === LANDSCAPE_LEFT || deviceOrientation === LANDSCAPE_RIGHT) Orientation.lockToLandscape();
      toast.show('Screen orientation LOCKED in EDIT mode');
    });
  };

  const unlockOrientation = () => {
    Orientation.unlockAllOrientations();
    toast.show('Screen orientation UNLOCKED');
  };

  return {
    lockOrientation: lockOrientation,
    unlockOrientation: unlockOrientation,
  };
};

export default useDeviceOrientation;
