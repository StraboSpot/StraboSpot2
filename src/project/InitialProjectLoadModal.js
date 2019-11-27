import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements';
import {Dialog, DialogTitle, DialogContent, SlideAnimation} from 'react-native-popup-dialog';

import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';
import Spacer from '../shared/ui/Spacer';

// Styles
import commonStyles from '../shared/common.styles';
import homeStyles from '../views/home/Styles';

const InitialProjectLoadModal = (props) => {
  const [showSection, setShowSection] = useState('none');

  const renderListOfProjectsOnServer = () => {
    return (
      <React.Fragment>
        <Spacer/>
        <View style={{height: 400}}>
          <ProjectList/>
        </View>
      </React.Fragment>
    );
  };

  const renderStartNewProject = () => {
    return (
      <React.Fragment>
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
          <ProjectTypesButtons
            onLoadProjectsFromServer={() => setShowSection('serverProjects')}
            onStartNewProject={() => setShowSection('newProject')}/>
          {showSection === 'none' ? null :
            showSection === 'serverProjects' ? renderListOfProjectsOnServer() : renderStartNewProject()
          }
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
