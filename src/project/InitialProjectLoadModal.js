import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Button} from 'react-native-elements';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';

import ProjectList from './ProjectList';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import ProjectTypesButtons from './ProjectTypesButtons';
import Spacer from '../shared/ui/Spacer';

// Styles
import commonStyles from '../shared/common.styles';
import homeStyles from '../views/home/Styles';
import {isEmpty} from '../shared/Helpers';
import {projectReducers} from './Project.constants';

const InitialProjectLoadModal = (props) => {
  const selectedProject = useSelector(state => state.project.project);
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  useEffect(() => {
    renderModalButtons();
    console.log('Rendered');
  }, [selectedProject, isOnline]);

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch({type: projectReducers.PROJECTS, project: {}});
      dispatch({type: projectReducers.DATASETS.PROJECT_DATASETS, datasets: null});
      setVisibleInitialSection('serverProjects');
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      // projectDatasets.map(data => data.current = false);
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const renderModalButtons = () => {
    if (!isEmpty(selectedProject)) {
      return (
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Continue'}
          disabled={isEmpty(projectDatasets) || isEmpty(projectDatasets.find(dataset => dataset.active === true))}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <ProjectTypesButtons
        onLoadProjectsFromServer={() => setVisibleInitialSection('serverProjects')}
        onStartNewProject={() => setVisibleInitialSection('newProject')}/>
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
          title={'Close'}
          disabled={isEmpty(projectDatasets.find(dataset => dataset.current === true))}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{alignItems: 'center'}}>
          <Text>Please select a dataset to make active</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <ActiveDatasetsList/>
        </View>
      </React.Fragment>
    );
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
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Continue'}
          disabled={isEmpty(projectDatasets) || isEmpty(projectDatasets.find(dataset => dataset.active === true))}
          buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
        <Spacer/>
        <View style={commonStyles.standardButtonText}>
          <Text>  By default the first dataset selected will be made the current dataset. You can change this on the next
            page and in the Active Project section of the Home Menu.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <DatasetList/>
        </View>
      </React.Fragment>
    );
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
            <ProjectList/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderStartNewProject = () => {
    return (
      <React.Fragment>
        {renderProjectTypesButtons()}
        <Spacer/>
        <Text>Need fields for a new project here.</Text>
        <Button
          onPress={() => props.closeModal()}
          title={'Close Modal (temporary)'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
        />
      </React.Fragment>
    );
  };

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
            title={'My StraboSpot'}
            style={homeStyles.dialogTitleContainer}
            textStyle={homeStyles.dialogTitleText}
          />
        }
      >
        <DialogContent>
          <Spacer/>
          {visibleInitialSection === 'none' ? renderProjectTypesButtons() :
            visibleInitialSection === 'serverProjects' ? renderListOfProjectsOnServer() : renderStartNewProject()
          }
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
