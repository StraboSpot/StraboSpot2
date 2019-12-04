import React, {useState, useEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {connect, useSelector, useDispatch} from 'react-redux';
import * as RemoteServer from '../services/server-requests';
import {settingPanelReducers} from '../components/settings-panel/settingsPanel.constants';
// import {USER_DATA} from '../services/user/User.constants';
import Loading from '../shared/ui/Loading';
import {ListItem, Button} from 'react-native-elements';
import {isEmpty} from '../shared/Helpers';
import * as themes from '../shared/styles.constants';
import DialogBox from './DialogBox';
import {withNavigation} from 'react-navigation';
import * as ProjectActions from './Project.constants';
import * as Project from './project';
import styles from './Project.styles';
import {homeReducers} from '../views/home/Home.constants';
import {SettingsMenuItems} from '../components/settings-panel/SettingsMenu.constants';

const ProjectList = (props) => {
  const currentProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user.userData);
  const dispatch = useDispatch();
  const [projectsArr, setProjectsArr] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    getAllProjects();
  }, []);

  const getAllProjects = async () => {
    setLoading(true);
    const projects = await RemoteServer.getMyProjects(userData.encoded_login);
    if (projects === 401) {
      setLoading(false);
    }
    else {
      // console.log('Projects', projects.projects);
      setProjectsArr(projects);
      setLoading(false);
    }
  };

  const getProjectDatasets = async (project) => {
    const projectDatasetsFromServer = await RemoteServer.getProjectDatasets(project.id, userData.encoded_login);
    if (projectDatasetsFromServer === 401) {
      console.log('Uh Oh...');
    }
    else {
      console.log('Saved datasets:', projectDatasetsFromServer);
      dispatch({type: ProjectActions.projectReducers.DATASETS.PROJECT_DATASETS, datasets: projectDatasetsFromServer.datasets});
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
      setShowDialog(true);
    }
    else {
      const projectData = await Project.loadProjectRemote(project.id, userData.encoded_login);
      console.log('Loaded project \n', projectData);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      await getProjectDatasets(project);
    }
  };

  const switchProject = async (action) => {
    if (action === ProjectActions.BACKUP_TO_SERVER || action === ProjectActions.BACKUP_TO_DEVICE) {
      console.log('User wants to:', action);
      getSelectedProject();
    }
    else if (action === ProjectActions.OVERWRITE) {
      console.log('User wants to:', action, 'and select', selectedProject.name);
      const projectData = await Project.loadProjectRemote(selectedProject.id, userData.encoded_login);
      dispatch({type: ProjectActions.projectReducers.PROJECTS, project: projectData});
      setShowDialog(false);
      dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});

    }
    else setShowDialog(false);
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
              onPress={() => selectProject(item)}
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
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    // settingsPageVisible: state.settingsPanel.settingsPageVisible,
    // userData: state.user.userData,
    // isOnline: state.home.isOnline,
    // currentProject: state.project.project,
  };
};

const mapDispatchToProps = {
  // setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  // setUserData: (userData) => ({type: USER_DATA, userData: userData}),
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ProjectList));
