import React from 'react';
import {Text, View} from 'react-native';

// Styles
import sidePanelStyles from './sidePanel.styles';
import {Button, Icon} from 'react-native-elements';
import styles from '../project/project.styles';

const SidePanelHeader = (props) => {
  return (
    <React.Fragment>
      <View style={sidePanelStyles.sidePanelHeaderContainer}>
        <Button
          icon={
            <Icon
              name={'ios-arrow-back'}
              type={'ionicon'}
              color={'black'}
              iconStyle={styles.buttons}
              size={20}
            />
          }
          title={props.title}
          type={'clear'}
          containerStyle={{flex: 0, padding: 4}}
          titleStyle={styles.buttonText}
          onPress={props.onPress}
        />
      </View>

    </React.Fragment>
  );
};

export default SidePanelHeader;
