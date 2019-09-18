import React from 'react';
import ToastPopup from 'react-native-root-toast';
import {heightPercentageToDP as hp} from "react-native-responsive-screen";

const Toast = (props) => {
  return (
      <ToastPopup
        visible={props.visible}
        animation={true}
        hideOnPress={true}
        backgroundColor={'white'}
        textColor={'black'}
        position={hp('40%')}
        onShow={() => props.onShow()}
      >
        {props.children}
      </ToastPopup>
  );
};

export default Toast;
