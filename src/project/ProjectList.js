import React, {useState, useEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect, useSelector, useDispatch} from 'react-redux';
// import * as RemoteServer from '../services/useServerRequests';
import {settingPanelReducers} from '../components/settings-panel/settingsPanel.constants';
// import {USER_DATA} from '../services/user/User.constants';
import Loading from '../shared/ui/Loading';
import {ListItem, Button} from 'react-native-elements';
import {isEmpty} from '../shared/Helpers';
import * as themes from '../shared/styles.constants';
import DialogBox from './DialogBox';
import {withNavigation} from 'react-navigation';
import * as ProjectActions from './Project.constants';
import useProjectHelpers from './project';
import styles from './Project.styles';
import {SettingsMenuItems} from '../components/settings-panel/SettingsMenu.constants';
import {spotReducers} from '../spots/Spot.constants';
import useServerRequests from '../services/useServerRequests';
import {homeReducers} from '../views/home/Home.constants';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  // Server calls
  const [serverRequests] = useServerRequests();
  const [projectHelpers] = useProjectHelpers();

  useEffect(() => {
    getAllProjects();
  }, []);

  const getAllProjects = async () => {
    dispatch({type: homeReducers.SET_LOADING, bool: true});
    try {
      const projectsResponse = await serverRequests.getMyProjects(userData.encoded_login);
        setProjectsArr(projectsResponse);
      dispatch({type: homeReducers.SET_LOADING, bool: false});
        setErrorMessage(false);
    }
    catch (err) {
      console.log(err);
      dispatch({type: homeReducers.SET_LOADING, bool: false});
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

  const getSelectedProject = () => {
    setShowDialog(false);
    console.log(selectedProject.id);
  };

  const selectProject = async (project) => {
    console.log('Selected Project:', project);
    setSelectedProject(project);
    if (!isEmpty(currentProject)) {
      setSelectedProject(project);
      setShowDialog(true);
    }
    else {
      const projectData = await projectHelpers.loadProjectRemote(project.id, userData.encoded_login);
      console.log('Loaded project \n', projectData);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      await getDatasets(project);
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER || action === ProjectActions.BACKUP_TO_DEVICE) {
      console.log('User wants to:', action);
      getSelectedProject();
    }
    else if (action === ProjectActions.OVERWRITE) {
      console.log('User wants to:', action, 'and select', selectedProject.name);
      await dispatch({type: spotReducers.SPOTS_CLEARED, spots: {}});
      const projectData = await projectHelpers.loadProjectRemote(selectedProject.id, userData.encoded_login);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      await getDatasets(selectedProject);
      setShowDialog(false);
    }
    else setShowDialog(false);
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
        {renderProjectsList()}
      </View>
      {renderDialog()}
      {errorMessage && renderErrorMessage()}
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    // settingsPageVisible: state.settingsPanel.settingsPageVisible,
    // userData: state.user
    // isOnline: state.home.isOnline,
    // currentProject: state.project.project,
  };
};

const mapDispatchToProps = {
  // setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  // setUserData: (userData) => ({type: USER_DATA, userData: userData}),
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ProjectList));
