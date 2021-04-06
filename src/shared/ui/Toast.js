import React from 'react';

import Toast from 'react-native-easy-toast';

import homeStyles from '../../modules/home/home.style';

const ToastPopup = (props) => {
  return (
    <Toast
      ref={props.toastRef}
      style={[homeStyles.toastContainer, props.style]}
      position='top'
      positionValue={props.positionValue || 300}
      fadeInDuration={500}
      fadeOutDuration={2000}
      opacity={0.9}
      textStyle={homeStyles.toastText}
    />
  );
};

export default ToastPopup;
