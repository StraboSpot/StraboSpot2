import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
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

const InitialProjectLoadModal = (props) => {
  const selectedProject = useSelector(state => state.project.project);
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  useEffect(() => {
    renderModalButtons();
    console.log('Rendered');
  }, [selectedProject, isOnline]);

  const renderModalButtons = () => {
    if (!isEmpty(selectedProject)) {
      return (
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Continue'}
          disabled={isEmpty(projectDatasets) || isEmpty(projectDatasets.find(dataset => dataset.active === true))}
          buttonStyle={[commonStyles.standardButton,]}
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
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          title={'Continue'}
          disabled={isEmpty(projectDatasets) || isEmpty(projectDatasets.find(dataset => dataset.active === true))}
          buttonStyle={[commonStyles.standardButton,]}
          titleStyle={commonStyles.standardButtonText}
        />
        <Spacer/>
        <View style={{height: 400}}>
          <DatasetList/>
        </View>
      </React.Fragment>
      );
  };

  const renderListOfProjectsOnServer = () => {
    if (isOnline){
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
    }
    else {
      return (
        <React.Fragment>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 22, color: 'red'}}>Not Online!</Text>
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
