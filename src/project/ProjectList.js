import React, {useState, useEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {settingPanelReducers} from '../components/settings-panel/settingsPanel.constants';
import Loading from '../shared/ui/Loading';
import {ListItem, Button} from 'react-native-elements';
import {isEmpty} from '../shared/Helpers';
import * as themes from '../shared/styles.constants';
import DialogBox from './DialogBox';
import {withNavigation} from 'react-navigation';
import * as ProjectActions from './Project.constants';
import useProjectHook from './useProject';
import styles from './Project.styles';
import {SettingsMenuItems} from '../components/settings-panel/SettingsMenu.constants';
import {spotReducers} from '../spots/Spot.constants';
import useServerRequests from '../services/useServerRequests';
// import DatasetList from './DatasetList';
// import sharedDialogStyles from '../shared/common.styles';
// import ProgressCircle from '../shared/ui/ProgressCircle';
import {homeReducers} from '../views/home/Home.constants';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [uploadErrors, setUploadErrors] = useState(false);
  // Server calls
  const [serverRequests] = useServerRequests();
  const [useProject] = useProjectHook();

  useEffect(() => {
    getAllProjects();
  }, []);

  const getAllProjects = async () => {
    setLoading(true);
    try {
      const projectsResponse = await serverRequests.getMyProjects(userData.encoded_login);
        setProjectsArr(projectsResponse);
        setLoading(false);
        setErrorMessage(false);
    }
    catch (err) {
      console.log(err);
      setLoading(false);
      setErrorMessage(true);
    }
  };

  const getDatasets = async (project) => {
    const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, userData.encoded_login);
    if (projectDatasetsFromServer === 401) {
      console.log('Uh Oh...');
    }
    else {
      console.log('Saved datasets:', projectDatasetsFromServer);
      projectDatasetsFromServer.datasets.map(dataset => {
        dataset.active = false;
      });
      const datasets = Object.assign({}, ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch({type: ProjectActions.projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasets});
    }
  };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    setLoading(true);
    setSelectedProject(project);
    if (!isEmpty(currentProject)) {
      setSelectedProject(project);
      setLoading(false);
      setShowDialog(true);
    }
    else {
      console.log('Getting project...');
      const projectData = await serverRequests.getProject(project.id, userData.encoded_login);
      console.log('Loaded project \n', projectData);
      setLoading(false);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      await getDatasets(project);
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER) {
      dispatch({type: homeReducers.SET_LOADING, bool: true});
      console.log('User wants to:', action);
      try {
        setShowDialog(false);
        const project = await serverRequests.updateProject(currentProject, userData.encoded_login);
        await dispatch({type: spotReducers.CLEAR_SPOTS, spots: {}});
        console.log('Finished uploading project', project);
        dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: true});
        dispatch({type: 'CLEAR_STATUS_MESSAGES'});
        await dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Upload Complete!'});
        const projectData = await useProject.loadProjectRemote(selectedProject.id, userData.encoded_login);
        dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
        await getDatasets(selectedProject);
        dispatch({type: homeReducers.SET_LOADING, bool: false});
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
      await dispatch({type: spotReducers.CLEAR_SPOTS});
      const projectData = await useProject.loadProjectRemote(selectedProject.id, userData.encoded_login);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      await getDatasets(selectedProject);
      setShowDialog(false);
    }
    else {
      setShowDialog(false);
    }
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});
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
          <Text style={styles.signInText}>
            Sign in to download {'\n'} projects
          </Text>
          <Button
            title={'Sign In'}
            onPress={() => props.navigation.navigate('SignIn')}
          />
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
      {/*{renderStatusDialog()}*/}
      {errorMessage && renderErrorMessage()}
    </View>
  );
};

export default withNavigation(ProjectList);
