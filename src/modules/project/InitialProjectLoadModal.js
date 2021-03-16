import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Avatar, Button} from 'react-native-elements';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import {useSelector, useDispatch} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import {REDUX} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import Spacer from '../../shared/ui/Spacer';
import {setSignedInStatus} from '../home/home.slice';
import homeStyles from '../home/home.style';
import {clearedSpots} from '../spots/spots.slice';
import ActiveDatasetsList from './ActiveDatasetsList';
import DatasetList from './DatasetList';
import NewProject from './NewProjectForm';
import ProjectList from './ProjectList';
import {clearedProject, clearedDatasets} from './projects.slice';
import ProjectTypesButtons from './ProjectTypesButtons';

const InitialProjectLoadModal = (props) => {
  const navigation = useNavigation();
  const activeDatasetsId = useSelector(state => state.project.activeDatasetsIds);
  const selectedProject = useSelector(state => state.project.project);
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  const useDevice = useDeviceHook();

  useEffect(() => {
    doesBackupDirExist().then(exists => console.log('doesBackupDirExist: ', exists));
  }, []);

  useEffect(() => {
    console.log('UE InitialProjectLoadModal [isOnline]', isOnline);
    // return function cleanUp() {
    //   console.log('Initial Project Modal CleanUp');
    // };
  }, [isOnline]);

  const doesBackupDirExist = async () => {
    return await useDevice.doesDeviceBackupDirExist();
  };

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch(clearedProject());
      dispatch(clearedDatasets());
      dispatch(clearedSpots());
      setVisibleInitialSection('none');
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <View>
        <ProjectTypesButtons
          onLoadProjectsFromServer={() => setVisibleInitialSection('serverProjects')}
          onLoadProjectsFromDevice={() => setVisibleInitialSection('deviceProjects')}
          onStartNewProject={() => setVisibleInitialSection('project')}/>
      </View>
    );
  };

  const renderCurrentDatasetSelection = () => {
    return (
      <React.Fragment>
        <Button
          onPress={() => goBack()}
          title={'Go Back'}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
        <Button
          onPress={() => props.closeModal()}
          title={'Done'}
          disabled={isEmpty(activeDatasetsId)}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{alignItems: 'center', paddingTop: 10}}>
          <Text>Select the dataset to add new spots.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <ActiveDatasetsList/>
        </View>
      </React.Fragment>
    );
  };

  const renderContinueOrCloseButton = () => {
    if (activeDatasetsId.length > 1) {
      return (
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Next'}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
    else {
      return (
        <Button
          onPress={() => props.closeModal()}
          title={'Done'}
          disabled={isEmpty(activeDatasetsId)}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
  };

  const renderDatasetList = () => {
    return (
      <React.Fragment>
        <Button
          onPress={() => goBack()}
          title={'Go Back'}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
        {renderContinueOrCloseButton()}
        <Spacer/>
        <View style={commonStyles.standardButtonText}>
          <Text> By default the first dataset selected will be made the current dataset. You can change this on the next
            page and in the Active Project section of the Home Menu.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <DatasetList/>
        </View>
      </React.Fragment>
    );
  };

  const renderListOfProjectsOnDevice = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <React.Fragment>
          {renderProjectTypesButtons()}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={'device'}/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderListOfProjectsOnServer = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <React.Fragment>
          {renderProjectTypesButtons()}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={'server'}/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderSectionView = () => {
    switch (visibleInitialSection) {
      case 'serverProjects':
        return (
          renderListOfProjectsOnServer()
        );
      case 'deviceProjects':
        return (
          renderListOfProjectsOnDevice()
        );
      case 'project':
        return (
          renderStartNewProject()
        );
      default:
        return (
          renderProjectTypesButtons()
        );
    }
  };

  const renderStartNewProject = () => {
    return (
      <React.Fragment>
        {renderProjectTypesButtons()}
        <Spacer/>
        <View style={{height: 400}}>
          <NewProject openMainMenu={props.openMainMenu} onPress={() => props.closeModal()}/>
        </View>
      </React.Fragment>
    );
  };

  const displayFirstName = () => {
    if (user.name && !isEmpty(user.name)) return user.name.split(' ')[0];
    else return 'Guest';
  };

  const firstName = displayFirstName();

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={homeStyles.dialogBox}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        dialogTitle={
          <DialogTitle
            title={`Welcome to StraboSpot`}
            style={homeStyles.dialogTitleContainer}
            textStyle={homeStyles.dialogTitleText}
          />
        }
      >
        <DialogContent>
          <View style={{flexDirection: 'row', padding: 10, alignItems: 'center', justifyContent: 'space-evenly'}}>
            <Avatar source={{uri: user.image}} size={80} rounded avatarStyle={{}}/>
            <View>
              <Text style={{fontSize: 22}}>Hello, {firstName}!</Text>
              <Button
                title={user.name ? `Not ${user.name}?` : 'Sign in?'}
                type={'clear'}
                titleStyle={{...commonStyles.standardButtonText, fontSize: 10}}
                onPress={() => {
                  if (user.name) dispatch({type: REDUX.CLEAR_STORE});
                  dispatch(setSignedInStatus(false));
                  navigation.navigate('SignIn');
                }}
              />
            </View>
          </View>
          {renderSectionView()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
