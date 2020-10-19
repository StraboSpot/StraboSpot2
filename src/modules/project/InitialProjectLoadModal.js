import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-elements';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import {useSelector, useDispatch} from 'react-redux';

import {redux} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import Spacer from '../../shared/ui/Spacer';
import {setOnlineStatus} from '../home/home.slice';
import homeStyles from '../home/home.style';
import {spotReducers} from '../spots/spot.constants';
import ActiveDatasetsList from './ActiveDatasetsList';
import DatasetList from './DatasetList';
import NewProject from './NewProjectForm';
import ProjectList from './ProjectList';
import {clearedProject, clearedDatasets} from './projects.slice';
import ProjectTypesButtons from './ProjectTypesButtons';

const InitialProjectLoadModal = (props) => {
  const navigation = useNavigation();
  const selectedDataset = useSelector(state => state.project.selectedDatasetId);
  const selectedProject = useSelector(state => state.project.project);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const userName = useSelector(state => state.user.name);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  useEffect(() => {
    console.log('UE InitialProjectLoadModal [isOnline]');
    return function cleanUp() {
      console.log('Initial Project Modal CleanUp');
    };
  }, [isOnline]);

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch(clearedProject());
      dispatch(clearedDatasets());
      dispatch({type: spotReducers.CLEAR_SPOTS});
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
        <Button
          title={userName ? `Not ${userName}?` : 'Sign in?'}
          type={'clear'}
          containerStyle={commonStyles.buttonContainer}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => {
            if (userName) dispatch({type: redux.CLEAR_STORE});
            dispatch(setOnlineStatus({bool: false}));
            navigation.navigate('SignIn');
          }}
        />
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
          disabled={isEmpty(selectedDataset)}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{alignItems: 'center', paddingTop: 10}}>
          <Text>Set an active dataset</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <ActiveDatasetsList/>
        </View>
      </React.Fragment>
    );
  };

  const renderContinueOrCloseButton = () => {
    if (selectedDataset.length > 1) {
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
          disabled={isEmpty(selectedDataset)}
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
    if (userName && !isEmpty(userName)) return userName.split(' ')[0];
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
            title={`Welcome to StraboSpot, \n ${firstName}!`}
            style={homeStyles.dialogTitleContainer}
            textStyle={homeStyles.dialogTitleText}
          />
        }
      >
        <DialogContent>
          <Spacer/>
          {renderSectionView()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
