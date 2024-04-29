import React, {useEffect, useState} from 'react';
import {Animated, Linking, Platform, Pressable, Text, View} from 'react-native';

import styles from './versionCheck.styles';
import alert from '../../shared/ui/alert';
import VersionCheckHook from '../versionCheck/useVersionCheck';

const VersionCheckLabel = () => {
  const [versionObj, setVersionObj] = useState({});
  const [animatedPulse] = useState(new Animated.Value(0));

  const useVersionCheck = VersionCheckHook();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      useVersionCheck.checkAppStoreVersion().then((res) => {
        if (res.needsUpdate) {
          useVersionCheck.animateLabel(animatedPulse);

          // showAlert();
        }
        setVersionObj(res);
      });
    }
  }, []);

  const handlePress = async () => {
    alert('IMPORTANT',
      'Please make sure your data is uploaded to your online account before upgrading. '
      + ' It is best to delete and the reinstall the app',
      [
        {
          text: 'Go To Store', onPress: async () => {
            console.log('OK Pressed');
            const res = await Linking.canOpenURL(versionObj.url);
            if (res) await Linking.openURL(versionObj.url);
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        ]);
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => handlePress()}>
      {versionObj.needsUpdate && (
        <Animated.View
          style={{
            ...styles.twelvePointBurstContainer,
            transform: [{scale: animatedPulse}],
          }}>
          <View style={styles.twelvePointBurstMain}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Update Available!</Text>
              <View>
                <Text style={styles.versionText}>{versionObj.version}</Text>
                <Text style={styles.text}>
                  is available in the{' '}
                  {Platform.OS === 'ios' ? 'AppStore' : 'PlayStore'}
                </Text>
                <Text style={{...styles.text, fontSize: 10}}>
                  Press to go to{' '}
                  {Platform.OS === 'ios' ? 'AppStore' : 'PlayStore'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.twelvePointBurst30}/>
          <View style={styles.twelvePointBurst60}/>
        </Animated.View>
      )}
    </Pressable>
  );
};

export default VersionCheckLabel;
