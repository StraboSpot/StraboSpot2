import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {ListItem, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

// Components
import DialogBox from './DialogBox';
import Loading from '../../shared/ui/Loading';

// Hooks
import useProjectHook from './useProject';

// Utilities
import {isEmpty} from '../../shared/Helpers';

// Constants
import * as ProjectActions from './project.constants';
import {homeReducers} from '../home/home.constants';
import {projectReducers} from './project.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {spotReducers} from '../spots/spot.constants';

// Styles
import * as themes from '../../shared/styles.constants';
import styles from './project.styles';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // const [serverRequests] = useServerRequests();
  const [useProject] = useProjectHook();
  // const [useSpots] = useSpotsHook();

  useEffect(() => {
    return function cleanUp() {
      console.log('Cleaned Up 1');
    };
  }, []);

  useEffect(() => {
    getAllProjects().then(() => console.log('OK got projects'));
    return function cleanUp() {
      console.log('Cleaned Up 2');
    };
  }, [props.source]);

  useEffect(() => {
    console.log('projectsArr', projectsArr);
    return function cleanUp() {
      console.log('Cleaned Up 3');
    };
  }, [projectsArr]);

  const getAllProjects = async () => {
    let projectsResponse;
    setLoading(true);
    if (props.source === 'server') projectsResponse = await useProject.getAllServerProjects();
    else if (props.source === 'device') projectsResponse = await useProject.getAllDeviceProjects();
    if (!projectsResponse) {
      if (props.source === 'device') {
        dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: false});
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
      setSelectedProject(project);
      setShowDialog(true);
    }
    else {
      useProject.selectProject(project, props.source).then(currentProject => {
        if (!currentProject) {
          Alert.alert('Error getting selected project');
        }
        else setSelectedProject(currentProject);
        setLoading(false);
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Project loaded!'});
      });
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER) {
      console.log('User wants to:', action);
      try {
        setShowDialog(false);
        const project = await useProject.uploadProject(currentProject, userData.encoded_login);
        setIsError(false);
        console.log('Finished uploading project', project);
        const datasets = await useProject.uploadDatasets();
        console.log(datasets);
        await dispatch({type: spotReducers.CLEAR_SPOTS, spots: {}});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Project uploaded to server.'});

        const projectData = await useProject.selectProject(selectedProject, props.source);
        console.log('PROJECT DATA', projectData);
        await dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Project loaded!'});
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
      }
      catch (err) {
        setIsError(true);
        console.log('Error', err);
      }
    }
    else if (action === ProjectActions.BACKUP_TO_DEVICE) {
      console.log('User wants to:', action);
    }
    else if (action === ProjectActions.OVERWRITE) {
      setShowDialog(false);
      dispatch({type: 'CLEAR_STATUS_MESSAGES'});
      dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
      dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: true});
      if (props.source === 'device') {
        await useProject.selectProject(selectedProject, props.source);
        console.log('Loaded From Device');
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
        dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
      }
      else {
        return useProject.loadProjectRemote(selectedProject).then(projectData => {
          console.log('ProjectData', projectData);
          if (!projectData || typeof projectData === 'string') {
            setShowDialog(false);
            dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
            dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: false});
            if (projectData === 'No Spots!') {
              dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Project does not have any spots'});
              dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: true});
              dispatch(
                {type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
            }
            else Alert.alert('Error', 'No Project Data!');
          }
          else {
            dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
            dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
            dispatch(
              {type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
          }
        });
      }
    }
    else {
      setShowDialog(false);
    }
  };

  const renderDialog = () => {
    return (
      <DialogBox
        dialogTitle={'Delete Local Project Warning!'}
        visible={showDialog}
        isOnline={isOnline}
        cancel={() => setShowDialog(false)}
        onPress={(action) => switchProject(action)}
      >
        <Text>Switching projects will <Text style={{color: 'red'}}>DELETE </Text>
          the local copy of the current project: </Text>
        <Text style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
          {currentProject.description && !isEmpty(
            currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?</Text>
      </DialogBox>
    );
  };

  const renderErrorMessage = () => {
    return (
      <View>
        <Text style={{color: 'red', textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderServerProjectsList = () => {
    if (!isEmpty(projectsArr) && !isEmpty(userData)) {
      return (
        <ScrollView>
          {projectsArr.projects.map(item => {
            return <ListItem
              key={props.source === 'device' ? item.id : item.id}
              title={props.source === 'device' ? item.fileName : item.name}
              containerStyle={{width: '100%'}}
              titleStyle={!isOnline && {color: themes.PRIMARY_ITEM_TEXT_COLOR}}
              onPress={() => selectProject(item)}
              disabled={!isOnline}
              disabledStyle={{backgroundColor: 'lightgrey'}}
              chevron
              bottomDivider
            />;
          })}
        </ScrollView>);
    }
    else {
      return (
        <View style={styles.signInContainer}>
          <View>
            {props.source === 'server' && <Button
              title={'Retry'}
              onPress={() => getAllProjects()}
            />}
            {isError && renderErrorMessage()}
          </View>
        </View>
      );
    }
  };


  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        {loading ? <Loading style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}/> : renderServerProjectsList()}
      </View>
      {renderDialog()}
    </View>
  );
};

export default ProjectList;
