import React, {useState} from 'react';
import {Text, View} from 'react-native';

import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';
import Spacer from '../shared/ui/Spacer';
import UserProfile from '../components/user/UserProfile';

const MyStraboSpot = props => {
  const [showSection, setShowSection] = useState('none');

  return (
    <React.Fragment>
      {showSection === 'none' ?
        <View style={{padding: 10}}>
          <UserProfile/>
          <Spacer/>
          <ProjectTypesButtons
            onLoadProjectsFromServer={() => setShowSection('serverProjects')}
            onStartNewProject={() => setShowSection('newProject')}/>
        </View> :
        showSection === 'serverProjects' ? <ProjectList/> : <Text>Need fields for a new project here.</Text>}
    </React.Fragment>
  );
};

export default MyStraboSpot;
