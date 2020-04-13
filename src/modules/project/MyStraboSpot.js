import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements';

import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';
import Spacer from '../../shared/ui/Spacer';
import UserProfile from '../user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import NewProjectForm from './NewProjectForm';

const MyStraboSpot = props => {
  const [showSection, setShowSection] = useState('none');

  const renderSectionView = () => {
    switch (showSection) {
      case 'none':
        return (
          <View style={{padding: 10}}>
            <UserProfile/>
            <Spacer/>
            <ProjectTypesButtons
              onLoadProjectsFromServer={() => setShowSection('serverProjects')}
              onLoadProjectsFromDevice={() => setShowSection('deviceProjects')}
              onStartNewProject={() => setShowSection('project')}/>
            <Spacer/>
            <Divider sectionText={'Active project'}/>
            <ActiveProjectList openSidePanel={props.openSidePanel}/>
          </View>
        );
      case 'serverProjects':
        return (
          <View style={{paddingTop: 20, height: 600}}>
            <UserProfile/>
            <Divider sectionText={'Project List'}/>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <ProjectList/>
          </View>
        );
      case 'deviceProjects':
        return (
          <View style={{paddingTop: 20, height: 600}}>
            <UserProfile/>
            <Divider sectionText={'Project List'}/>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <Text>DEVICE PROJECTS LIST</Text>
          </View>
        );
      default:
        return (
          <View style={{paddingTop: 20, height: 600}}>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <NewProjectForm closeHomePanel={props.closeHomePanel}/>
          </View>
        );
    }
  };

  return (
    <React.Fragment>
      {/*{showSection === 'none' ?*/}
      {/*  <View style={{padding: 10}}>*/}
      {/*    <UserProfile/>*/}
      {/*    <Spacer/>*/}
      {/*    <ProjectTypesButtons*/}
      {/*      onLoadProjectsFromServer={() => setShowSection('serverProjects')}*/}
      {/*      onLoadProjectsFromDevice={() => setShowSection('deviceProjects')}*/}
      {/*      onStartNewProject={() => setShowSection('project')}/>*/}
      {/*  </View> :*/}
      {/*  showSection === 'serverProjects' ?*/}
      {/*    <View style={{paddingTop: 20, height: 600}}>*/}
      {/*      <UserProfile/>*/}
      {/*      <Divider sectionText={'Project List'}/>*/}
      {/*      <ProjectList/>*/}
      {/*    </View>*/}

      {/*    : <NewProjectForm closeHomePanel={props.closeHomePanel}/>}*/}
      {renderSectionView()}

    </React.Fragment>
  );
};

export default MyStraboSpot;
