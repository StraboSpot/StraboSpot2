import React from 'react';
import {View} from 'react-native';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {isEmpty} from '../../shared/Helpers';
import styles from './project.styles';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';


const ActiveProjectList = (props) => {
  const dispatch = useDispatch();

  const project = useSelector(state => state.project.project);

  const openSidePanel = () => {
    props.openSidePanel();
    // dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: true});
  };

  return (
    <React.Fragment>
      <View style={styles.sectionContainer}>
        <ListItem
        title={isEmpty(project) ? 'No Project' : project.description.project_name}
        containerStyle={styles.projectDescriptionListContainer}
        chevron
        onPress={() => openSidePanel()}
      />
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectList;
