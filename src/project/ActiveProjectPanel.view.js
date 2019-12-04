import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import {projectReducers} from './Project.constants';
import DatasetList from './DatasetList';

const ActiveProjectPanel = (props) => {

  const project = useSelector(state => state.project.project);
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const dispatch = useDispatch();

  useEffect(() => {
    let datasetsFiltered = null;
    if (projectDatasets){
      datasetsFiltered = projectDatasets.filter(dataset => dataset.switch === true);
      console.log(datasetsFiltered);
    }
    dispatch({type: projectReducers.DATASETS.ACTIVE_DATASETS, value: datasetsFiltered});
  }, [projectDatasets]);

  return (
    <React.Fragment>
      <ListItem
        title={project ? project.description.project_name : 'No Project'}
        containerStyle={styles.activeProjectButton}
        chevron
        onPress={props.onPress}
      />
      <Divider sectionText={'PROJECT DATASETS'}/>
      <View style={styles.datasetsContainer}>
      <DatasetList/>
      </View>
      <Divider sectionText={'CURRENT DATASETS'}/>
      <View style={[styles.datasetsContainer, {height: 200}]}>
        {/*{getActiveDatasets()}*/}
        {/*<FlatList*/}
        {/*  keyExtractor={(item, i) => item.id}*/}
        {/*  // extraData={refresh}*/}
        {/*  data={projectDatasets}*/}
        {/*  renderItem={renderActiveDatasets}*/}
        {/*/>*/}
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
