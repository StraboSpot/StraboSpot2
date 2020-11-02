import React from 'react';
import {View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import styles from './project.styles';

const ActiveProjectList = (props) => {
  const dispatch = useDispatch();

  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <View style={commonStyles.sectionContainer}>
        <ListItem
          containerStyle={styles.projectDescriptionListContainer}
          onPress={() => dispatch(setSidePanelVisible(
            {view: SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION, bool: true})
          )}
        >
          <ListItem.Content>
            <ListItem.Title>{!isEmpty(project) && project.description
              ?  project.description.project_name
              : 'No Project'}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectList;
