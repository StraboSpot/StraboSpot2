import React, {useEffect, useState} from 'react';
import {AppState, FlatList, Text, View} from 'react-native';

import LottieView from 'lottie-react-native';
import {Button, Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import commonStyles from '../../shared/common.styles';
import {capitalizeFirstLetter, isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import DeleteConformationDialogBox from '../../shared/ui/DeleteConformationDialogBox';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import useAnimationsHook from '../../shared/ui/useAnimations';
import {
  clearedStatusMessages,
  setBackupOverwriteModalVisible,
  setStatusMessageModalTitle,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import styles from './project.styles';
import {doesBackupDirectoryExist, setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [isDeleteConformationModalVisible, setIsDeleteConformationModalVisible] = useState(false);
  const [deletingProjectStatus, setDeletingProjectStatus] = useState('');
  const [projectsArr, setProjectsArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedProjectToDelete, setSelectedProjectToDelete] = useState(null);
  const [passwordInputVal, setPasswordTextInputVal] = useState('');

  const useAnimations = useAnimationsHook();
  const useDevice = useDeviceHook();
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

  const deleteProject = async () => {
    setDeletingProjectStatus('');
    setDeletingProjectStatus('deleting');
    if (props.source === 'device') {
      useDevice.deleteProjectOnDevice(selectedProjectToDelete.fileName);
      setProjectsArr(await useProject.getAllDeviceProjects());
      setDeletingProjectStatus('complete');
      setTimeout(() => setIsDeleteConformationModalVisible(false), 1500);
    }
    else {
      const res = await useProject.deleteProject(selectedProjectToDelete, passwordInputVal);
      if (res.error) {
        setDeletingProjectStatus('');
        setErrorMessage('Password cannot be empty');
      }
      else if (res === true) {
        console.log('Server project deleted!');
        // toast.show(`${selectedProjectToDelete.name} has been deleted successfully!`, {type: 'success'});
        setProjectsArr(await useProject.getAllServerProjects());
        // setIsButtonDisplayed(false);
        setDeletingProjectStatus('complete');
        setTimeout(() => setIsDeleteConformationModalVisible(false), 1500);
      }
      else if (res === false) {
        console.log('NOT A VALID PASSWORD');
        setDeletingProjectStatus('');
        setErrorMessage('Incorrect Password! Please re-enter.');
      }
      setPasswordTextInputVal('');
    }
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

  const initializeDelete = (project) => {
    setSelectedProjectToDelete(project);
    setIsDeleteConformationModalVisible(true);
  };

  const selectProject = async (project) => {
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

  const renderDeleteProjectModal = () => {
    const projectName = props.source === 'device' ? selectedProjectToDelete?.fileName : selectedProjectToDelete?.name;
    return (
      <DeleteConformationDialogBox
        title={`Delete from ${capitalizeFirstLetter(props.source)}`}
        visible={isDeleteConformationModalVisible}
        cancel={() => closeModal()}
        delete={() => deletingProjectStatus !== 'complete' && deleteProject(projectName)}
        deleteDisabled={props.source === 'server' && isEmpty(passwordInputVal) || deletingProjectStatus !== ''}
        cancelDisabled={deletingProjectStatus !== ''}
      >
        {deletingProjectStatus === '' ? <View>
            <View style={{}}>
              <Text style={commonStyles.dialogContentImportantText}>Are you sure you want to delete{'\n' + projectName}?
              </Text>
              <Text style={styles.dialogConfirmText}>This will
                <Text style={commonStyles.dialogContentImportantText}> ERASE </Text>
                everything in this project including Spots, images, and all other data!
              </Text>
            </View>
            {props.source === 'server' && (
              <View style={{paddingTop: 10}}>
                <Input
                  value={passwordInputVal}
                  placeholder={'Enter Password'}
                  autoCapitalize={'none'}
                  onChangeText={val => setPasswordTextInputVal(val)}
                  errorMessage={errorMessage}
                />
              </View>
            )}
          </View>
          : (
            // <View>
            <LottieView
              style={{width: 200, height: 200}}
              source={useAnimations.getAnimationType(
                deletingProjectStatus === 'deleting' ? 'deleteProject' : 'complete')}
              autoPlay
              loop={deletingProjectStatus === 'deleteProject'}
            />
            // </View>
          )}
      </DeleteConformationDialogBox>
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
        onPress={() => selectProject(item)}
        onLongPress={() => props.source === 'device' && initializeDelete(item)}
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
          <Text style={{margin: 10, textAlign: 'center'}}>Long press to delete project</Text>
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
      {renderDeleteProjectModal()}
    </React.Fragment>
  );
};

export default ProjectList;
