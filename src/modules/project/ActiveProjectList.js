import React from 'react';
import {View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import styles from './project.styles';

const ActiveProjectList = (props) => {
  const dispatch = useDispatch();

  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <View style={commonStyles.sectionContainer}>
        <ListItem
          containerStyle={styles.projectDescriptionListContainer}
          onPress={() => dispatch({
            type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
            view: settingPanelReducers.SET_SIDE_PANEL_VIEW.PROJECT_DESCRIPTION,
            bool: true,
          })}
        >
          <ListItem.Content>
            <ListItem.Title>{isEmpty(project) ? 'No Project' : project.description.project_name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectList;
