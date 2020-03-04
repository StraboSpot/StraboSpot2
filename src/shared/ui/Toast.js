import React from 'react';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Toast from 'react-native-easy-toast';
import homeStyles from '../../modules/home/home.style';

const ToastPopup = (props) => {
  return (
    <Toast
      ref={props.toastRef}
      style={homeStyles.photosSavedToastContainer}
      position='top'
      positionValue={300}
      fadeInDuration={500}
      fadeOutDuration={1000}
      opacity={0.8}
      textStyle={homeStyles.photoSavedToastText}
    />
  );
};

export default ToastPopup;
