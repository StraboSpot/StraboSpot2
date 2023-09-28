import React from 'react';
import {Alert, Linking, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {STRABO_APIS} from '../../services/urls.constants';
import {BLUE} from '../../shared/styles.constants';
import styles from './documentation.styles';

const Documentation = () => {
  const isOnline = useSelector(
    state => state.home.isOnline.isInternetReachable,
  );

  const helpUrl = STRABO_APIS.STRABO + '/help';

  const viewOnlineHelp = async (path) => {
    try {
      const canOpen = await Linking.canOpenURL(path);
      canOpen && (await Linking.openURL(path));
    }
    catch (err) {
      console.error('Can\t open URL', err);
      Alert.alert(' Unable to open URL!');
    }
  };

  const renderHelpLink = () => (
    <View style={styles.bottomButton}>
      {isOnline && (
        <Button
          title={'StraboSpot Help Center'}
          type={'clear'}
          onPress={() => viewOnlineHelp(helpUrl)}
          icon={
            <Icon
              name={'globe-outline'}
              type={'ionicon'}
              iconStyle={{paddingRight: 10}}
              size={20}
              color={BLUE}
            />
          }
        />
      )}
    </View>
  );

  return <View style={{flex: 1}}>{renderHelpLink()}</View>;
};

export default Documentation;
