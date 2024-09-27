import {useState} from 'react';

import Orientation, {PORTRAIT, PORTRAIT_UPSIDE_DOWN, useDeviceOrientationChange} from 'react-native-orientation-locker';
import {useToast} from 'react-native-toast-notifications';

const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState(null);

  const toast = useToast();

  const lockOrientation = () => {
    // console.log('Orientation', orientation);
    if (orientation === PORTRAIT || orientation === PORTRAIT_UPSIDE_DOWN) Orientation.lockToPortrait();
    else Orientation.lockToLandscape();
    toast.show('Screen orientation LOCKED in EDIT mode');
  };

  const unlockOrientation = () => {
    Orientation.unlockAllOrientations();
    toast.show('Screen orientation UNLOCKED');
  };

  useDeviceOrientationChange((o) => {
    // console.log('Orientation Change', o);
    setOrientation(o);
  });

  return {
    lockOrientation: lockOrientation,
    unlockOrientation: unlockOrientation,
  };
};

export default useDeviceOrientation;
