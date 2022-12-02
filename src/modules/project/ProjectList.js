import React, {useEffect, useState} from 'react';
import {AppState, FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import ProjectOptionsDialogBox from '../../shared/ui/modal/project-options-modal/ProjectOptionaDialogBox';
import {
  clearedStatusMessages,
  setBackupOverwriteModalVisible,
  setStatusMessageModalTitle,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import {doesBackupDirectoryExist, setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.project.databaseEndpoint);
  const isInitialProjectLoadModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [isDeleteConformationModalVisible, setIsDeleteConformationModalVisible] = useState(false);
  const [isProjectOptionsModalVisible, setIsProjectOptionsModalVisible] = useState(false);
  const [deletingProjectStatus, setDeletingProjectStatus] = useState('');
  const [projectsArr, setProjectsArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedProjectToDelete, setSelectedProjectToDelete] = useState(null);
  const [passwordInputVal, setPasswordTextInputVal] = useState('');

  const useDownload = useDownloadHook();
  const [useProject] = useProjectHook();
  const useImport = useImportHook();

  useEffect(() => {
    console.log('UE ProjectList []');
    AppState.addEventListener('change', handleStateChange);
    return () => {
      AppState.addEventListener(
        'change',
        () => console.log('APP STATE EVENT REMOVED IN PROJECT LIST')).remove();
    };
  }, []);

  useEffect(() => {
    console.log('UE ProjectList [props.source]', props.source);
    setDeletingProjectStatus('');
    getAllProjects().then(() => console.log('OK got projects'));
  }, [props.source]);

  const closeModal = () => {
    setIsDeleteConformationModalVisible(false);
    setErrorMessage('');
  };

  const handleStateChange = async (state) => {
    state === 'active'
    && props.source === 'device'
    && getAllProjects().then(() => console.log('Updated Project List'));
  };

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (props.source === 'server') {
      projectsResponse = await useProject.getAllServerProjects();
    }
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
      console.log('List of Projects:', projectsResponse);
      setProjectsArr(projectsResponse);
      setLoading(false);
    }
  };

  const reloadingList = async (isDeleted) => {
    if (isDeleted) {
      if (props.source === 'server') setProjectsArr(await useProject.getAllServerProjects());
      else if (props.source === 'device') setProjectsArr(await useProject.getAllDeviceProjects());
    }
    else console.log('Project was not deleted.');
  };

  const initializeProjectOptions = (project) => {
    // const projectName;
    dispatch(setSelectedProject({project: project, source: props.source}));
    if (isInitialProjectLoadModalVisible) {
      dispatch(setSelectedProject({project: '', source: ''}));
      const res = loadSelectedProject(project);
      console.log('Done loading project', res);
    }
    else setIsProjectOptionsModalVisible(true);
  };

  const loadSelectedProject = async (project) => {
    console.log('Selected Project:', project);
    if (project?.fileName?.includes('.zip')) {
      const unzippedFile = await useImport.unzipBackupFile(project.fileName);
      console.log(unzippedFile);
      project = unzippedFile;
    }
    if (!isEmpty(currentProject)) {
      dispatch(setSelectedProject({project: project, source: props.source}));
      dispatch(setBackupOverwriteModalVisible(true));
    }
    else {
      console.log('Getting project...');
      if (!isEmpty(project)) useProject.destroyOldProject();
      if (props.source === 'device') {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        const res = await useImport.loadProjectFromDevice(project);
        dispatch(setStatusMessageModalTitle(res.project.description.project_name));
        console.log('Done loading project', res);
      }
      else {
        dispatch(setStatusMessageModalTitle(project.name));
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        await useDownload.initializeDownload(project);
      }
    }
  };

  const renderProjectOptionsModal = () => {
    return (
      <ProjectOptionsDialogBox
        currentProject={currentProject}
        endpoint={endPoint}
        visible={isProjectOptionsModalVisible}
        onBackdropPress={() => setIsProjectOptionsModalVisible(false)}
        close={() => setIsProjectOptionsModalVisible(false)}
        open={() => setIsProjectOptionsModalVisible(true)}
        projectDeleted={value => reloadingList(value)}
      >
      </ProjectOptionsDialogBox>
    );
  };

  const renderErrorMessage = () => {
    return (
      <View>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderProjectItem = (item) => {
    return (
      <ListItem
        key={props.source === 'device' ? item.id : item.id}
        onPress={() => initializeProjectOptions(item)}
        containerStyle={commonStyles.listItem}
        disabled={!isOnline.isConnected && props.source !== 'device'}
        disabledStyle={{backgroundColor: 'lightgrey'}}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {props.source === 'device' ? item.fileName : item.name}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderProjectsList = () => {
    if (!isEmpty(userData)) {
      return (
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={item => item.id.toString()}
            data={projectsArr.projects}
            renderItem={({item}) => renderProjectItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={
              <View>
                {props.source === 'server' ? (
                    <Button
                      title={'Retry'}
                      onPress={() => getAllProjects()}
                      buttonStyle={{width: 80, alignSelf: 'center'}}
                    />
                  )
                  : <ListEmptyText text={'No Projects Available'}/>
                }
                {isError && renderErrorMessage()}
              </View>
            }/>
        </View>
      );
    }
  };

  return (
    <React.Fragment>
      <View style={{alignSelf: 'center'}}>
        {/*<SectionDivider dividerText={props.source === 'server' ? 'Projects on Server' : 'Projects on Local Device'}/>*/}
      </View>
      <Loading isLoading={loading} style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/>
      {renderProjectsList()}
      {!isEmpty(currentProject) && renderProjectOptionsModal()}
    </React.Fragment>
  );
};

export default ProjectList;
