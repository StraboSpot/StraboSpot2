import {Dimensions} from 'react-native';

import RNOrientationDirector, {Orientation} from 'react-native-orientation-director';
import {useToast} from 'react-native-toast-notifications';

const useDeviceOrientation = () => {
  const toast = useToast();

  const lockOrientation = () => {
    const {width, height} = Dimensions.get('window');
    const orientation = width > height ? Orientation.landscape : Orientation.portrait;
    RNOrientationDirector.lockTo(orientation);
    toast.show('Screen orientation LOCKED');
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
