import React, {useEffect, useState} from 'react';
import {AppState, FlatList, Text, View} from 'react-native';

import moment from 'moment';
import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {doesBackupDirectoryExist, setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import ProjectOptionsDialogBox from '../../shared/ui/modal/project-options-modal/ProjectOptionsModal';
import SectionDivider from '../../shared/ui/SectionDivider';
import {
  setProjectLoadSelectionModalVisible,
  setStatusMessageModalTitle,
} from '../home/home.slice';

const ProjectList = ({source}) => {
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.connections.databaseEndpoint);
  const isInitialProjectLoadModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const isOnline = useSelector(state => state.connections.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [isProjectOptionsModalVisible, setIsProjectOptionsModalVisible] = useState(false);
  const [projectsArr, setProjectsArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
    console.log('UE ProjectList [source]', source);
    getAllProjects().then(() => console.log('OK got projects'));
    console.log('Project Options Modal Visible', isProjectOptionsModalVisible);
    return () => {
      setIsProjectOptionsModalVisible(false);
      console.log('Project Options Modal Visible (in return)', isProjectOptionsModalVisible);
    };
  }, []);

  const handleStateChange = async (state) => {
    state === 'active'
    && source === 'device'
    && getAllProjects().then(() => console.log('Updated Project List'));
  };

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (source === 'server') {
      projectsResponse = await useProject.getAllServerProjects();
    }
    else if (source === 'device') {
      projectsResponse = await useProject.getAllDeviceProjects(APP_DIRECTORIES.BACKUP_DIR);
      console.log('Device Files', projectsResponse);
    }
    // if (Platform.OS === 'android' && source === 'exports') {
    //   // const exists = await useProject.doesDeviceBackupDirExist(undefined, true);
    //   // console.log(exists);
    //   // const externalStorageProjectsResponse = await useProject.getAllDeviceProjects(
    //   //   APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
    //   const externalStorageProjectsResponse = await useDevice.getExternalProject();
    //   // setProjectsArr(externalStorageProjectsResponse);
    //   console.log('Exported Projects', externalStorageProjectsResponse);
    // }
    if (!projectsResponse) {
      if (source === 'device') {
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
      if (source === 'server') setProjectsArr(await useProject.getAllServerProjects());
      else if (source === 'device') {
        const newArr = await useProject.getAllDeviceProjects(APP_DIRECTORIES.BACKUP_DIR);
        setProjectsArr(newArr);
      }
    }
    else console.log('Project was not deleted.');
  };

  const initializeProjectOptions = async (project) => {
    // const projectName;
    dispatch(setSelectedProject({project: project, source: source}));
    if (isInitialProjectLoadModalVisible) {
      dispatch(setSelectedProject({project: '', source: ''}));
      const res = await loadSelectedProject(project);
      console.log('Done loading project from InitialProjectModal', res);
    }
    else setIsProjectOptionsModalVisible(true);
  };

  const loadSelectedProject = async (project) => {
    console.log('Selected Project:', project);
    setLoading(true);
    if (!isEmpty(currentProject)) {
      dispatch(setSelectedProject({project: project, source: source}));
    }
    else {
      console.log('Getting project...');
      if (!isEmpty(project)) useProject.destroyOldProject();
      if (source === 'device') {
        dispatch(setProjectLoadSelectionModalVisible(false));
        const res = await useImport.loadProjectFromDevice(project.fileName);
        setLoading(false);
        dispatch(setStatusMessageModalTitle(res.project.description.project_name));
        console.log('Done loading project', res);
      }
      else await useDownload.initializeDownload(project);
    }
  };

  const renderProjectOptionsModal = () => {
    return (
      <ProjectOptionsDialogBox
        currentProject={currentProject}
        endpoint={endPoint}
        visible={isProjectOptionsModalVisible}
        closeModal={() => setIsProjectOptionsModalVisible(false)}
        open={() => setIsProjectOptionsModalVisible(true)}
        projectDeleted={value => reloadingList(value)}
       />
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
    const modifiedTimeAndDate = moment.unix(item.modified_timestamp).format('MMMM Do YYYY, h:mm:ss a');
    return (
      <ListItem
        key={item.id}
        onPress={() => initializeProjectOptions(item)}
        containerStyle={commonStyles.listItem}
        disabled={!isOnline.isConnected && source !== 'device'}
        disabledStyle={{backgroundColor: 'lightgrey'}}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {source === 'server' ? item.name : item.fileName}
          </ListItem.Title>
          <ListItem.Subtitle style={commonStyles.listItemSubtitle}>Updated: {modifiedTimeAndDate}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderProjectsList = () => {
    if (!isEmpty(userData)) {
      return (
        <View style={{flex: 1}}>
          <View style={{paddingBottom: 0}}>
            <SectionDivider dividerText={source === 'device' ? 'Saved Projects' : 'Projects to Import'}/>
          </View>
          <FlatList
            keyExtractor={item => item.id.toString()}
            data={projectsArr.projects}
            renderItem={({item}) => renderProjectItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={
              <View>
                {source === 'server' ? (
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

  // const renderProjectListAndroidsDownloads = () => {
  //   return (
  //     <View style={{flex: 2}}>
  //       <SectionDivider dividerText={'Download Folder Projects'}/>
  //       <FlatList
  //         data={externalStorageProjects}
  //         renderItem={({item}) => renderExternalProjectsItem(item)}
  //       />
  //     </View>
  //   );
  // };
  //
  // const renderImportOverlay = () => {
  //   return (
  //     <Overlay
  //       isVisible={isImportOverlayVisible}
  //       onBackdropPress={() => setIsImportOverlayVisible(false)}
  //     >
  //       <View style={{width: 300, height: 300}}>
  //
  //       </View>
  //     </Overlay>
  //   );
  // };

  return (
    <View style={{flex: 1}}>
      <Loading isLoading={loading} style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/>
      {renderProjectsList()}
      {/*{Platform.OS === 'android' && source === 'device' && renderProjectListAndroidsDownloads()}*/}
      {renderProjectOptionsModal()}
      {/*{renderImportOverlay()}*/}
    </View>
  );
};

export default ProjectList;
