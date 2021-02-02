import React from 'react';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';

const ActiveProjectList = () => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <SectionDivider dividerText={'Active Project'}/>
      <ListItem
        containerStyle={commonStyles.listItem}
        onPress={() => dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.PROJECT_DESCRIPTION, bool: true}))}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {!isEmpty(project) && project.description ? project.description.project_name : 'No Project'}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    </React.Fragment>
  );
};

export default ActiveProjectList;
