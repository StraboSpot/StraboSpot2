import React from 'react';
import styles from "./SettingsPanelStyles";
import {Icon, Header} from "react-native-elements";
import * as themes from '../../shared/styles.constants';

const SettingsPanelHeader = (props) => {
  return (
    <Header
      backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
      leftComponent={
            <Icon
            name={'ios-arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={styles.buttons}
            // containerStyle={{backgroundColor: 'red', paddingRight: 20, paddingLeft: 20}}
            onPress={() => props.onPress()}
            size={30}
          />}
      containerStyle={{alignItems: 'flex-start', justifyContent: 'center'}}
      centerComponent={{text: props.children, style: styles.headerText}}
    />
  )
};

export default SettingsPanelHeader;
