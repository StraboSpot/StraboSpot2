import React from 'react';
import {Text, View} from 'react-native';
import ButtonNoBackground from "../../shared/ui/ButtonNoBackround";
import styles from "./SettingsPanelStyles";
import {Icon, Header} from "react-native-elements";
import * as themes from '../../shared/styles.constants';

const SettingsPanelHeader = (props) => {
  // return (
  {/*  <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'pink', justifyContent: 'space-evenly'*/}
  {/*  }}>*/}
  {/*    <View style={{justifyContent: 'center'}}>*/}
  {/*      <Icon*/}
  {/*        name={'ios-arrow-back'}*/}
  {/*        type={'ionicon'}*/}
  {/*        color={themes.BLUE}*/}
  {/*        iconStyle={[styles.buttons]}*/}
  {/*        onPress={() => props.onPress()}*/}
  {/*        size={30}*/}
  {/*      />*/}
  {/*    </View>*/}
  {/*    <View style>*/}
  {/*        <Text style={styles.headingText}>{props.children}</Text>*/}
  {/*    </View>*/}
  {/*  </View>*/}
  {/*);*/}
  return (
    <Header
      backgroundColor={themes.SECONDARY_BACKGROUND_COLOR}
      leftComponent={
            <Icon
            name={'ios-arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={styles.buttons}
            onPress={() => props.onPress()}
            size={30}
          />}
      containerStyle={{alignItems: 'flex-start', justifyContent: 'center'}}
      centerComponent={{text: props.children, style: styles.headingText}}
    />
  )
};

export default SettingsPanelHeader;
