import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import Spacer from '../../shared/ui/Spacer';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import UserProfile from '../user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import NewProjectForm from './NewProjectForm';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';

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
          </View>
        );
      case 'serverProjects':
        return (
          <View>
            <View style={{height: 600}}>
              <UserProfile/>
              <Divider sectionText={'Server Project List'}/>
              <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
              <ProjectList source={'server'}/>
            </View>
            <View style={{paddingTop: 40}}>
              <Divider sectionText={'Active project'}/>
              <ActiveProjectList openSidePanel={props.openSidePanel}/>
            </View>
          </View>
        );
      case 'deviceProjects':
        return (
          <View>
            <View style={{height: 600}}>
              <UserProfile/>
              <Divider sectionText={'Device Project List'}/>
              <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
              <ProjectList source={'device'}/>
            </View>
            <View style={{paddingTop: 40}}>
              <Divider sectionText={'Active project'}/>
              <ActiveProjectList openSidePanel={props.openSidePanel}/>
            </View>
          </View>
        );
      default:
        return (
          <View style={{height: 600}}>
            <Button title={'Back'} type={'clear'} onPress={() => setShowSection('none')}/>
            <NewProjectForm closeHomePanel={props.closeHomePanel}/>
          </View>
        );
    }
  };

  return (
    <React.Fragment>
      {renderSectionView()}
    </React.Fragment>
  );
};

export default MyStraboSpot;
