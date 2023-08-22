import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';

import projectStyles from '../../project/project.styles';
import sidePanelStyles from '../sidePanel.styles';

const SidePanelHeader = (props) => {
  return (
    <View style={sidePanelStyles.sidePanelHeaderContainer}>
      <Button
        icon={
          <Icon
            name={'arrow-back'}
            type={'ionicon'}
            iconStyle={projectStyles.buttons}
            size={20}
          />
        }
        title={props.title}
        type={'clear'}
        titleStyle={projectStyles.buttonText}
        onPress={props.backButton}
      />
      <View style={projectStyles.headerTextContainer}>
        <Text style={projectStyles.headerText}>{props.headerTitle}</Text>
      </View>
    </View>
  );
};

export default SidePanelHeader;
