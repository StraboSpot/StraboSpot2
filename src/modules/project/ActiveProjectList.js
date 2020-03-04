import React from 'react';
import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';

import styles from './project.styles';


const ActiveProjectList = (props) => {

  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <ListItem
        title={isEmpty(project) ? 'No Project' : project.description.project_name}
        containerStyle={styles.activeProjectButton}
        chevron
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default ActiveProjectList;
