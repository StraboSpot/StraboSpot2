import buttonStyles from "../ui/ui.styles";
import {SpotPages} from "../Notebook.constants";
import {Button} from "react-native-elements/src/index";
import React from "react";
import {View} from "react-native";
import * as themes from "../../../themes/ColorThemes";

const saveAndClose = (props) => {
  return (
    <View style={buttonStyles.navButtonsContainer}>
      <View style={buttonStyles.leftContainer}>
        <Button
          titleStyle={{color: themes.BLUE}}
          title={'Cancel'}
          type={'clear'}
          onPress={props.cancel}
        />
        <Button
          titleStyle={{color: themes.BLUE}}
          title={'Save'}
          type={'clear'}
          onPress={props.save}
        />
      </View>
    </View>
  )
};

export default saveAndClose;
