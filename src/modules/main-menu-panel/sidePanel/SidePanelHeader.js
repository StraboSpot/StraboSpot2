import React from 'react';
import {Text, View} from 'react-native';

import {Header, Icon} from 'react-native-elements';

import * as themes from '../../../shared/styles.constants';
import projectStyles from '../../project/project.styles';

const SidePanelHeader = (props) => {

  const backArrow = () => {
    return (
      <Icon
        name={'arrow-back'}
        type={'ionicon'}
        iconStyle={projectStyles.buttons}
        size={25}
        onPress={props.backButton}
      />
    );
  };

  const headerTitle = () => {
    return (
      <View style={projectStyles.headerTextContainer}>
        <Text style={projectStyles.headerText}>{props.headerTitle}</Text>
      </View>
    );
  };

  return (
    <Header
      leftComponent={backArrow()}
      centerComponent={headerTitle()}
      containerStyle={{
        backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
        justifyContent: 'space-around',
      }}
      rightComponent={props.rightComponent}
    />
    // <View style={sidePanelStyles.sidePanelHeaderContainer}>
    //   <Button
    //     icon={
    //       <Icon
    //         name={'arrow-back'}
    //         type={'ionicon'}
    //         iconStyle={projectStyles.buttons}
    //         size={25}
    //       />
    //     }
    //     type={'clear'}
    //     // buttonStyle={{alignItems: 'center'}}
    //     containerStyle={sidePanelStyles.sidePanelButtonContainer}
    //     onPress={props.backButton}
    //   />
    //   <View style={projectStyles.headerTextContainer}>
    //     <Text style={projectStyles.headerText}>{props.headerTitle}</Text>
    //   </View>
    // </View>
  );
};

export default SidePanelHeader;
