import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';

import {ListItem, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setBackupModalVisible,
  setInfoMessagesModalVisible,
  setSelectedProject,
  setStatusMessagesModalVisible,
  setUploadModalVisible,
} from '../home/home.slice';
import BackUpOverwriteModal from './BackUpOverwriteModal';
import * as ProjectActions from './project.constants';
import styles from './project.styles';
import {doesBackupDirectoryExist} from './projects.slice';
import useDownloadHook from './useDownload';
import useImportHook from './useImport';
import useProjectHook from './useProject';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [projectSelection, setProjectSelection] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const useDownload = useDownloadHook();
  const [useProject] = useProjectHook();
  const useImport = useImportHook();

  useEffect(() => {
    getAllProjects().then(() => console.log('OK got projects'));
  }, [props.source]);

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (props.source === 'server') projectsResponse = await useProject.getAllServerProjects();
    else if (props.source === 'device') projectsResponse = await useProject.getAllDeviceProjects();
    if (!projectsResponse) {
      if (props.source === 'device') {
        dispatch(doesBackupDirectoryExist(false));
        setIsError(true);
        setErrorMessage('Cannot find a backup directory on this device...');
      }
      else setErrorMessage('Error getting project');
      setLoading(false);
    }
    else {
      setIsError(false);
      console.log('List of Projects on Server:', projectsResponse);
      setProjectsArr(projectsResponse);
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    if (!isEmpty(currentProject)) {
      setProjectSelection(project);
      setShowDialog(true);
    }
    else {
      try {
        console.log('Getting project...');
        if (!isEmpty(project)) useProject.destroyOldProject();
        if (props.source === 'device') {
          dispatch(clearedStatusMessages());
          dispatch(setStatusMessagesModalVisible(true));
          const res = await useImport.loadProjectFromDevice(project);
          console.log('Done loading project', res);
        }
        else {
          dispatch(clearedStatusMessages());
          dispatch(setStatusMessagesModalVisible(true));
          await useDownload.initializeDownload(project, props.source);
        }
      }
      catch (err) {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage({
          statusMessage: `There is not a project named: 
          \n\n${projectSelection.description.project_name}\n\n on the server...`,
        }));
        dispatch(setInfoMessagesModalVisible(true));
        throw err.ok;
      }
      if (!currentProject) Alert.alert('Error getting selected project');
      else setLoading(false);
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER) {
      console.log('User wants to:', action);
      try {
        setShowDialog(false);
        setIsError(false);
        dispatch(setSelectedProject({source: props.source, project: projectSelection}));
        dispatch(setUploadModalVisible(true));
      }
      catch (err) {
        setIsError(true);
        console.log('Error', err);
      }
    }
    else if (action === ProjectActions.BACKUP_TO_DEVICE) {
      setShowDialog(false);
      dispatch(setSelectedProject({source: props.source, project: projectSelection}));
      dispatch(setBackupModalVisible(true));
    }
    else if (action === ProjectActions.OVERWRITE) {
      setShowDialog(false);
      if (props.source === 'device') {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        const res = await useImport.loadProjectFromDevice(projectSelection);
        console.log('Done loading project', res);
      }
      else await useDownload.initializeDownload(projectSelection, props.source);
    }
    else {
      setShowDialog(false);
    }
  };

  const renderBackupOverwriteModal = () => {
    return (
      <BackUpOverwriteModal
        dialogTitle={'Delete Local Project Warning!'}
        visible={showDialog}
        isOnline={isOnline}
        cancel={() => setShowDialog(false)}
        onPress={(action) => switchProject(action)}
      >
        <Text>Switching projects will
          <Text style={{color: 'red'}}> DELETE </Text>
          the local copy of the current project:
        </Text>
        <Text style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
          {currentProject.description
          && !isEmpty(currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?
        </Text>
      </BackUpOverwriteModal>
    );
  };

  const renderErrorMessage = () => {
    return (
      <View>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderProjectsList = () => {
    const titleStyle = !isOnline ? {color: themes.PRIMARY_ITEM_TEXT_COLOR} : {color: themes.SECONDARY_ITEM_TEXT_COLOR};
    if (!isEmpty(projectsArr) && !isEmpty(userData)) {
      return (
        <ScrollView>
          {projectsArr.projects.map(item => {
            return <ListItem
              key={props.source === 'device' ? item.id : item.id}
              containerStyle={{width: '100%'}}
              onPress={() => selectProject(item)}
              disabled={!isOnline && props.source !== 'device'}
              disabledStyle={{backgroundColor: 'lightgrey'}}
              bottomDivider
            >
              <ListItem.Content>
                <ListItem.Title
                  style={titleStyle}>{props.source === 'device' ? item.fileName : item.name}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron/>
            </ListItem>;
          })}
        </ScrollView>);
    }
    else {
      return (
        <View style={styles.signInContainer}>
          <View>
            {props.source === 'server' && (
              <Button
                title={'Retry'}
                onPress={() => getAllProjects()}
              />
            )}
            {isError && renderErrorMessage()}
          </View>
        </View>
      );
    }
  };


  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        {loading ? <Loading style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/> : renderProjectsList()}
      </View>
      {renderBackupOverwriteModal()}
    </View>
  );
};

export default ProjectList;
