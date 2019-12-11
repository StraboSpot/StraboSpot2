import React from 'react';
import styles from './Project.styles';
import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';


const ActiveProjectList = (props) => {

  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <ListItem
        title={project ? project.description.project_name : 'No Project'}
        containerStyle={styles.activeProjectButton}
        chevron
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default ActiveProjectList;
