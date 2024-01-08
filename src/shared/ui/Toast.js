import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {ToastProvider} from 'react-native-toast-notifications';

const ToastPopup = ({children}) => {
  return (
    <ToastProvider
      placement={'top'}
      offset={75}
      animationDuration={250}
      duration={3000}
      textStyle={{fontWeight: 'bold', paddingLeft: 5}}
      normalColor={'black'}
      successIcon={
        <Icon
          name={'done'}
          color={'white'}
          size={25}
        />
      }
      warningIcon={
        <Icon
          name={'error-outline'}
          color={'white'}
          size={25}
        />
      }
      renderType={{
        noWifi: toast => (
          <View style={{padding: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={'wifi-off'} containerStyle={{paddingEnd: 10}}/>
            <Text>{toast.message}</Text>
          </View>
        ),
      }}
    >
      {children}
    </ToastProvider>
  );
};

export default ToastPopup;
