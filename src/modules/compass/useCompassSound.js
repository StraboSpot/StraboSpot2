import {useEffect} from 'react';

import SoundPlayer from 'react-native-sound-player';

const useCompassSound = () => {

  useEffect(() => {
    console.log('UE useCompassSound []');
    try {
      SoundPlayer.loadAsset(require('../../assets/sounds/compass_button_click.mp3'));
    }
    catch (error) {
      if (error) console.log('Failed to load sound', error);
    }
  }, []);

  const playCompassSound = () => {
    SoundPlayer.play((success) => {
      if (success) console.log('successfully finished playing compass sound');
      else console.log('compass sound failed due to audio decoding errors');
    });
  };

  return {
    playCompassSound: playCompassSound,
  };

};

export default useCompassSound;
