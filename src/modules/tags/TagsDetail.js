import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import styles from '../project/project.styles';
import {Button, Icon} from 'react-native-elements';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {useDispatch, useSelector} from 'react-redux';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
// Styles
import tagStyles from './Tags.styles';
import SidePanelHeader from '../main-menu-panel/SidePanelHeader';
import {isEmpty} from '../../shared/Helpers';

const TagDetail = (props) => {

  const dispatch = useDispatch();
  const mainMenuPage = useSelector(state => state.settingsPanel.settingsPageVisible);
  const selectedTag = useSelector(state => state.settingsPanel.tag);

  const [tag, setTag] = useState({

  })

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
        title={'Tags'}
        type={'clear'}
        // containerStyle={{flex: 0, padding: 0}}
        titleStyle={styles.buttonText}
        onPress={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
      />
    );
  };

  const renderTagInfo = () => {
    return (
    <View style={tagStyles.sectionContainer}>
      <TextInput
        value={!isEmpty(selectedTag) && selectedTag.name}
        // onChangeText={(text) => }
      />
    </View>
    );
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
        title={'Tags'}
        headerTitle={!isEmpty(selectedTag) && selectedTag.name}
      />
      <View>
        <Divider sectionText={'Tag Info'}/>
        {renderTagInfo()}
        <Divider sectionText={'Tagged Spots'}/>
      </View>
    </React.Fragment>
  );
};

export default TagDetail;
