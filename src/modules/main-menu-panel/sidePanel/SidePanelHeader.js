import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';

import styles from '../mainMenuPanel.styles';
import sidePanelStyles from '../sidePanel.styles';

const SidePanelHeader = (props) => {
  return (
    <View style={sidePanelStyles.sidePanelHeaderContainer}>
      <View style={sidePanelStyles.sidePanelButtonContainer}>
        <Button
          icon={
            <Icon
              name={'ios-arrow-back'}
              type={'ionicon'}
              iconStyle={styles.buttons}
              size={20}
            />
          }
          title={props.title}
          type={'clear'}
          onPress={props.backButton}
          titleStyle={sidePanelStyles.sidePanelBackText}
        />
      </View>
      <View style={styles.mainMenuHeaderTextContainer}>
        <Text style={styles.headerText}>{props.headerTitle}</Text>
      </View>
    </View>
  );
};

export default SidePanelHeader;
