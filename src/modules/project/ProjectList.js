import React, {useState, useEffect} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Loading from '../../shared/ui/Loading';
import {ListItem, Button} from 'react-native-elements';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import DialogBox from './DialogBox';
import * as ProjectActions from './project.constants';
import useProjectHook from './useProject';
import styles from './project.styles';
import {spotReducers} from '../spots/spot.constants';
import useServerRequests from '../../services/useServerRequests';
// import DatasetList from './DatasetList';
// import sharedDialogStyles from '../shared/common.home';
// import ProgressCircle from '../shared/ui/ProgressCircle';
import {homeReducers} from '../home/home.constants';
import useSpotsHook from '../spots/useSpots';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadErrors, setUploadErrors] = useState(false);
  // Server calls
  const [serverRequests] = useServerRequests();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();

  useEffect(() => {
    getAllProjects().then(() => console.log('OK'));
    return function cleanUp () {
      console.log('Cleaned Up');
    };
  }, []);

  const getAllProjects = async () => {
    setLoading(true);
    const projectsResponse = await useProject.getAllProjects();
    if (!projectsResponse) {
      setErrorMessage('Error getting project');
      setLoading(false);
    }
    else {
      setProjectsArr(projectsResponse);
      setLoading(false);
    }
  };

  // const getDatasets = async (project) => {
  //   return await useProject.getDatasets((project));
  // };
  // const getDatasets = async (project) => {
  //   const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, userData.encoded_login);
  //   if (projectDatasetsFromServer === 401) {
  //     console.log('Uh Oh...');
  //   }
  //   else {
  //     console.log('Saved datasets:', projectDatasetsFromServer);
  //     if (projectDatasetsFromServer.datasets.length === 1) {
  //       projectDatasetsFromServer.datasets[0].active = true;
  //       projectDatasetsFromServer.datasets[0].current = true;
  //       console.log('Downloaded Spots');
  //     }
  //     else {
  //       projectDatasetsFromServer.datasets.map(dataset => {
  //         dataset.active = false;
  //       });
  //     }
  //
  //     const datasets = Object.assign({}, ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
  //     dispatch({type: ProjectActions.projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasets});
  //     await useSpots.downloadSpots(projectDatasetsFromServer.datasets[0], userData.encoded_login);
  //   }
  // };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    setLoading(true);
    if (!isEmpty(currentProject)) {
      setSelectedProject(project);
      setLoading(false);
      setShowDialog(true);
    }
    else {
      const projectData = await useProject.selectProject(project);
      if (!projectData) {
        setErrorMessage('Error getting selected project');
      }
      setLoading(false);
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER) {
      console.log('User wants to:', action);
      try {
        setShowDialog(false);
        const project = await serverRequests.updateProject(currentProject, userData.encoded_login);
        await dispatch({type: spotReducers.CLEAR_SPOTS, spots: {}});
        console.log('Finished uploading project', project);
        dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: true});
        dispatch({type: 'CLEAR_STATUS_MESSAGES'});
        await dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Upload Complete!'});
        const projectData = await useProject.loadProjectRemote(selectedProject.id);
        dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
        await useProject.getDatasets(selectedProject);
      }
      catch (err) {
        setUploadErrors(true);
        console.error('Error', err);
      }
    }
    else if (action === ProjectActions.BACKUP_TO_DEVICE) {
      console.log('User wants to:', action);
    }
    else if (action === ProjectActions.OVERWRITE) {
      console.log('User wants to:', action, 'and select', selectedProject.name);
      return useProject.loadProjectRemote(selectedProject).then(projectData => {
        console.log('ProjectData', projectData);
        if (!projectData) {
          setShowDialog(false);
          Alert.alert('Error');
        }
        setShowDialog(false);
        dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.MANAGE.ACTIVE_PROJECTS});
      });
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
          {!isEmpty(currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?</Text>
      </DialogBox>
    );
  };

  const renderErrorMessage = () => {
    return (<View>
      <Text style={{color: 'red'}}>Error Getting Data</Text>
    </View>);
  };

  const renderProjectsList = () => {
    if (!isEmpty(projectsArr) && !isEmpty(userData)) {
      // console.log(projectsArr.projects);
      return (
        <ScrollView>
          {projectsArr.projects.map(item => {
            return <ListItem
              key={item.id}
              title={item.name}
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
            <Button
              title={'Retry'}
              onPress={() => getAllProjects()}
            />
              {renderErrorMessage()}
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
      {renderDialog()}
    </View>
  );
};

export default ProjectList;
