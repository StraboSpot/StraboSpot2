import React from 'react';
import {View, Text} from 'react-native';
import styles from './SettingsPanelStyles';
import {useSelector} from 'react-redux';
import {Icon, Header} from 'react-native-elements';
import {SettingsMenuItems} from './SettingsMenu.constants';

const SettingsPanelHeader = (props) => {
  const pageVisible = useSelector(state => state.settingsPanel.settingsPageVisible);

  return (
    <View style={styles.settingsPanelHeaderContainer}>
      <View style={styles.settingsPanelIconContainer}>
        {pageVisible !== SettingsMenuItems.SETTINGS_MAIN ? <Icon
          name={'ios-arrow-back'}
          type={'ionicon'}
          color={'black'}
          iconStyle={styles.buttons}
          // containerStyle={{backgroundColor: 'red', paddingRight: 20, paddingLeft: 20}}
          onPress={() => props.onPress()}
          size={30}
        /> : null}
      </View>
      <View style={styles.settingsPanelHeaderTextContainer}>
        <Text style={styles.headerText}>{pageVisible}</Text>
      </View>
      <View style={{flex: 1}}></View>
    </View>
  );
  // return (
  //   <Header
  //     backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
  //     leftComponent={
  //       {...pageVisible !== SettingsMenuItems.SETTINGS_MAIN ? <Icon
  //         name={'ios-arrow-back'}
  //         type={'ionicon'}
  //         color={'black'}
  //         iconStyle={styles.buttons}
  //         // containerStyle={{backgroundColor: 'red', paddingRight: 20, paddingLeft: 20}}
  //         onPress={() => props.onPress()}
  //         size={30}
  //       /> : null}}
  //     containerStyle={{justifyContent: 'center', backgroundColor: 'red', flexWrap: 'wrap'}}
  //     centerComponent={{text: props.children, style: styles.headerText}}
  //   />
  // );
};

export default SettingsPanelHeader;
