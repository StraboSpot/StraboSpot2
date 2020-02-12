import React from 'react';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Toast from 'react-native-easy-toast';
import styles from '../../views/home/Styles';

const ToastPopup = (props) => {
  return (
    <Toast
      ref={props.toastRef}
      style={styles.photosSavedToastContainer}
      position='top'
      positionValue={300}
      fadeInDuration={300}
      fadeOutDuration={1000}
      opacity={0.8}
      textStyle={styles.photoSavedToastText}
    />
  );
};

export default ToastPopup;
