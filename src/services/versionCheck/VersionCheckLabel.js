import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Animated, Linking, Platform, Pressable, Text, View} from 'react-native';

import styles from './versionCheck.styles';
import VersionCheckHook from '../versionCheck/useVersionCheck';

const VersionCheckLabel = () => {
  const [versionObj, setVersionObj] = useState({});
  const animatedPulse = useMemo(() => new Animated.Value(0), []);

  const useVersionCheck = VersionCheckHook();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      useVersionCheck.animateLabel(animatedPulse);
      useVersionCheck.checkAppStoreVersion().then((res) => {
        if (res.needsUpdate) showAlert();
        setVersionObj(res);
      });
    }
  }, []);

  const handlePress = async () => {
    const res = await Linking.canOpenURL(versionObj.url);
    if (res) await Linking.openURL(versionObj.url);
  };

  const showAlert = () => {
    Alert.alert('IMPORTANT',
      'Please make sure your data is uploaded to your online account before upgrading. '
      + ' It is best to delete and the reinstall the app',
      [
        {
          text: 'OK', onPress: async () => {
            console.log('OK Pressed');
          },
        }]);
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
