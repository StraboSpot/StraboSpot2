import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {REDUX} from '../../../shared/app.constants';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import ActiveDatasetsList from '../../project/ActiveDatasetsList';
import DatasetList from '../../project/DatasetList';
import NewProject from '../../project/NewProjectForm';
import projectStyles from '../../project/project.styles';
import ProjectList from '../../project/ProjectList';
import {clearedDatasets, clearedProject} from '../../project/projects.slice';
import ProjectTypesButtons from '../../project/ProjectTypesButtons';
import {clearedSpots} from '../../spots/spots.slice';
import userStyles from '../../user/user.styles';
import useUserProfileHook from '../../user/useUserProfile';
import {setStatusMessageModalTitle} from '../home.slice';
import homeStyles from '../home.style';

const InitialProjectLoadModal = (props) => {
  const welcomeTitle = 'Welcome to StraboSpot';
  const serverTitle = 'Projects on Server';
  const deviceTitle = 'Projects on Device';
  const navigation = useNavigation();
  const activeDatasetsId = useSelector(state => state.project.activeDatasetsIds);
  const selectedProject = useSelector(state => state.project.project);
  const statusMessageModalTitle = useSelector(state => state.home.statusMessageModalTitle);
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');
  const [source, setSource] = useState('');

  const useUserProfile = useUserProfileHook();

  useEffect(() => {
    return () => {
      setVisibleInitialSection('none');
    };
  }, []);

  useEffect(() => {
    console.log('UE InitialProjectLoadModal [isOnline]', isOnline);
    dispatch(setStatusMessageModalTitle(welcomeTitle));
  }, [isOnline]);

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch(clearedProject());
      dispatch(clearedDatasets());
      dispatch(clearedSpots());
      setVisibleInitialSection(source === 'device' ? 'deviceProjects' : 'serverProjects');
      dispatch(setStatusMessageModalTitle(source === 'device'
        ? deviceTitle : source === 'server' ? serverTitle : welcomeTitle));
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const goBackToMain = () => {
    if (visibleInitialSection !== 'none') {
      setVisibleInitialSection('none');
      dispatch(setStatusMessageModalTitle(welcomeTitle));
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <View>
        <ProjectTypesButtons
          onLoadProjectsFromServer={() => handleOnPress('serverProjects')}
          onLoadProjectsFromDevice={() => handleOnPress('deviceProjects')}
          onStartNewProject={() => handleOnPress('project')}/>
      </View>
    );
  };

  const handleOnPress = (type) => {
    switch (type) {
      case 'serverProjects':
        setSource('server');
        setVisibleInitialSection('serverProjects');
        dispatch(setStatusMessageModalTitle('Projects on Server'));
        break;
      case 'deviceProjects':
        setSource('device');
        setVisibleInitialSection('deviceProjects');
        dispatch(setStatusMessageModalTitle('Projects on Device'));
        break;
      case 'project':
        setVisibleInitialSection('project');
        dispatch(setStatusMessageModalTitle('Start New Project'));
        break;
      default:
        setVisibleInitialSection('none');
        dispatch(setStatusMessageModalTitle(welcomeTitle));
    }


  };

  const renderCurrentDatasetSelection = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            onPress={() => goBack()}
            type={'clear'}
            title={'Back'}
            // buttonStyle={[commonStyles.standardButton]}
            // titleStyle={commonStyles.standardButtonText}
          />
          <Button
            onPress={() => props.closeModal()}
            title={'Done'}
            type={'clear'}
            disabled={isEmpty(activeDatasetsId)}
            // buttonStyle={commonStyles.standardButton}
            // titleStyle={commonStyles.standardButtonText}
          />
        </View>
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
          type={'clear'}
          title={'Next'}
          // buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
    else {
      return (
        <Button
          onPress={() => props.closeModal()}
          type={'clear'}
          title={'Done'}
          disabled={isEmpty(activeDatasetsId)}
          // buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
  };

  const renderDatasetList = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            onPress={() => goBack()}
            type={'clear'}
            title={'Back'}
            // buttonStyle={[commonStyles.standardButton]}
            titleStyle={commonStyles.standardButtonText}
          />
          {renderContinueOrCloseButton()}
        </View>
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
          <View style={{alignContent: 'center', marginTop: 10}}>
            <Button
              onPress={() => goBackToMain()}
              title={'Back'}
              type={'clear'}
              icon={
                <Icon
                  name={'arrow-back'}
                  type={'ionicon'}
                  color={'black'}
                  iconStyle={projectStyles.buttons}
                  size={25}
                />
              }
              containerStyle={{alignItems: 'flex-start'}}
              titleStyle={commonStyles.standardButtonText}
            />
          </View>
          {/*{renderProjectTypesButtons()}*/}
          {/*<Spacer/>*/}
          <View style={{height: 400}}>
            <ProjectList source={source}/>
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
        <View style={{alignContent: 'center', marginTop: 10}}>
          <Button
            onPress={() => goBackToMain()}
            title={'Back'}
            type={'clear'}
            icon={
              <Icon
                name={'arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={projectStyles.buttons}
                size={25}
              />
            }
            containerStyle={{alignItems: 'flex-start'}}
            titleStyle={commonStyles.standardButtonText}
          />
          {/*{renderProjectTypesButtons()}*/}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={source}/>
          </View>
        </View>
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
        <Button
          onPress={() => goBackToMain()}
          title={'Back'}
          type={'clear'}
          icon={
            <Icon
              name={'arrow-back'}
              type={'ionicon'}
              color={'black'}
              iconStyle={projectStyles.buttons}
              size={25}
            />
          }
          containerStyle={{alignItems: 'flex-start'}}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{height: 400}}>
          <NewProject openMainMenu={props.openMainMenu} onPress={() => props.closeModal()}/>
        </View>
      </React.Fragment>
    );
  };

  const renderUserProfile = () => {
    return (
      <View style={{flexDirection: 'row', padding: 10, alignItems: 'center', justifyContent: 'space-evenly'}}>
        {user.name && <Avatar
          source={user.image && {uri: user.image}}
          title={useUserProfile.getUserInitials()}
          titleStyle={userStyles.avatarPlaceholderTitleStyle}
          size={80} rounded
        />}
        <View>
          <Text style={{fontSize: 22}}>Hello, {firstName}!</Text>
          <Button
            title={user.name ? `Not ${user.name}?` : 'Sign in?'}
            type={'clear'}
            titleStyle={{...commonStyles.standardButtonText, fontSize: 10}}
            onPress={() => {
              if (user.name) dispatch({type: REDUX.CLEAR_STORE});
              // dispatch(setSignedInStatus(false));
              setVisibleInitialSection('none');
              navigation.navigate('SignIn');
            }}
          />
        </View>
      </View>
    );
  };

  const displayFirstName = () => {
    if (user.name && !isEmpty(user.name)) return user.name.split(' ')[0];
    else return 'Guest';
  };

  const firstName = displayFirstName();

  return (
    <React.Fragment>
      <Overlay
        animationType={'slide'}
        isVisible={props.visible}
        overlayStyle={homeStyles.dialogBox}
      >
        <View style={homeStyles.dialogTitleContainer}>
          <Text style={homeStyles.dialogTitleText}>{statusMessageModalTitle}</Text>
        </View>
        {visibleInitialSection === 'none' && renderUserProfile()}
        {renderSectionView()}
      </Overlay>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
