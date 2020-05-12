import React from 'react';
import {Text, View} from 'react-native';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {Button, Icon} from 'react-native-elements';
import styles from '../../project/project.styles';
import {SettingsMenuItems} from '../../main-menu-panel/mainMenu.constants';
import {useSelector} from 'react-redux';

const EditCustomMaps = (props) => {
    console.log(props)
  const renderBackButton = () => {
    return (
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
        title={'Custom Maps'}
        type={'clear'}
        containerStyle={{flex: 0, padding: 4}}
        titleStyle={styles.buttonText}
        onPress={props.closeSidePanel}
      />
    );
  };

  return (
    <React.Fragment>
      <View style={styles.sidePanelHeaderContainer}>
        {renderBackButton()}
      </View>
      <Divider sectionText={'Map Name'}/>
    </React.Fragment>
  );
};

export default EditCustomMaps;
