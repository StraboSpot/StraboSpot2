import React from 'react';

import {ToastProvider} from 'react-native-toast-notifications';
import {Icon} from 'react-native-elements';
import * as themes from '../styles.constants';

import homeStyles from '../../modules/home/home.style';
import {Text, View} from 'react-native';

const ToastPopup = (props) => {
  return (
    <ToastProvider
      placement={'top'}
      offset={125}
      animationDuration={250}
      duration={3000}
      textStyle={{fontWeight: 'bold', paddingLeft: 5}}
      normalColor={'black'}
      successIcon={<Icon
        name="done"
        color="white"
        size={25}
      />}
      warningIcon={
        <Icon
          name='error-outline'
          color="white"
          size={25}
        />
      }
      renderType={{
          noWifi: (toast) => (
            <View style={{padding: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center'}}>
              <Icon name={'wifi-off'} containerStyle={{paddingEnd: 10}}/>
              <Text>{toast.message}</Text>
            </View>
          )
        }}
    >
      {props.children}
    </ToastProvider>
  );
};

export default ToastPopup;
