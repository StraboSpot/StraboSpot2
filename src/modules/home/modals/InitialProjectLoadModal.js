import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import useResetStateHook from '../../../services/useResetState';
import commonStyles from '../../../shared/common.styles';
import {isEmpty, truncateText} from '../../../shared/Helpers';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import Spacer from '../../../shared/ui/Spacer';
import ImportProjectFromZip from '../../project/ImportProjectFromZip';
import NewProject from '../../project/NewProjectForm';
import projectStyles from '../../project/project.styles';
import ProjectList from '../../project/ProjectList';
import ProjectTypesButtons from '../../project/ProjectTypesButtons';
import userStyles from '../../user/user.styles';
import useUserProfileHook from '../../user/useUserProfile';
import {setLoadingStatus, setStatusMessageModalTitle} from '../home.slice';
import overlayStyles from '../overlays/overlay.styles';

const InitialProjectLoadModal = ({closeModal, logout, openMainMenuPanel, visible}) => {
  console.log('Rendering InitialProjectLoadModal...');

  const dispatch = useDispatch();
  const statusMessageModalTitle = useSelector(state => state.home.statusMessageModalTitle);
  const isOnline = useSelector(state => state.connections.isOnline);
  const user = useSelector(state => state.user);

  const [displayName, setDisplayName] = useState('');
  const [importComplete, setImportComplete] = useState(false);
  const [importedProjectData, setImportedProjectData] = useState({});
  const [source, setSource] = useState('');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');

  const toast = useToast();
  const useDevice = useDeviceHook();
  const useResetState = useResetStateHook();
  const useUserProfile = useUserProfileHook();

  const displayFirstName = () => {
    if (user.name && !isEmpty(user.name)) return user.name.split(' ')[0];
    else return 'Guest';
  };

  useEffect(() => {
    setDisplayName(displayFirstName);
    return () => {
      setVisibleInitialSection('none');
      setDisplayName('');
    };
  }, []);

  useEffect(() => {
    console.log('UE InitialProjectLoadModal [isOnline]', isOnline);
    dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
  }, [isOnline]);

  const goBackToMain = () => {
    if (visibleInitialSection !== 'none') {
      setVisibleInitialSection('none');
      setImportComplete(false);
      dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <View>
        <ProjectTypesButtons
          onLoadProjectsFromServer={() => handleOnPress('serverProjects')}
          onLoadProjectsFromDevice={() => handleOnPress('deviceProjects')}
          onLoadProjectsFromDownloadsFolder={() => handleOnPress('exportedProjects')}
          onStartNewProject={() => handleOnPress('project')}/>
      </View>
    );
  };

  const getExportedAndroidProject = async () => {
    try {
      dispatch(setLoadingStatus({bool: true, view: 'modal'}));
      const res = await useDevice.getExternalProjectData();
      console.log('EXTERNAL PROJECT', res);
      dispatch(setLoadingStatus({bool: false, view: 'modal'}));
      if (!isEmpty(res)) {
        dispatch(setStatusMessageModalTitle('Import Project'));
        setImportedProjectData(res);
        setVisibleInitialSection('importData');
        dispatch(setLoadingStatus({bool: false, view: 'modal'}));
      }
    }
    catch (err) {
      dispatch(setLoadingStatus({bool: false, view: 'modal'}));
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.warn(err.message);
        toast.show(err.message);
      }
      else {
        console.error('Error picking document!');
      }
    }
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
      case 'exportedProjects':
        getExportedAndroidProject().catch(err => console.error('Error getting exported project', err));
        break;
      case 'project':
        setVisibleInitialSection('project');
        dispatch(setStatusMessageModalTitle('Start New Project'));
        break;
      default:
        setVisibleInitialSection('none');
        dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
    }


  };

  const renderListOfProjectsOnDevice = () => {
    return (
      <>
        <View style={{alignContent: 'center', marginTop: 10}}>
          <Button
            onPress={() => goBackToMain()}
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
        <View style={{height: 400}}>
          <ProjectList source={source}/>
        </View>
      </>
    );
  };

  const renderListOfProjectsOnServer = () => {
    return (
      <View style={{alignContent: 'center', marginTop: 10}}>
        <Button
          onPress={() => goBackToMain()}
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
        <Spacer/>
        <View style={{height: 400}}>
          <ProjectList source={source}/>
        </View>
      </View>
    );
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
      case 'importData':
        return (
          <ImportProjectFromZip
            goBackToMain={() => goBackToMain()}
            importComplete={importComplete}
            importedProject={importedProjectData}
            setImportComplete={value => setImportComplete(value)}
            source={sourcePath => setSource(sourcePath)}
            visibleSection={section => setVisibleInitialSection(section)}
          />
        );
      default:
        return (
          renderProjectTypesButtons()
        );
    }
  };

  const renderStartNewProject = () => {
    return (
      <>
        <Button
          onPress={() => goBackToMain()}
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
          <NewProject onPress={closeModal} openMainMenuPanel={openMainMenuPanel}/>
        </View>
      </>
    );
  };

  const renderUserProfile = () => {
    return (
      <View style={userStyles.initialProjectLoadProfileContainer}>
        {user.name && <Avatar
          source={user.image && {uri: user.image}}
          title={useUserProfile.getInitials()}
          titleStyle={userStyles.avatarPlaceholderTitleStyle}
          size={80} rounded
        />}
        <View style={userStyles.initialProjectLoadProfileHeaderContainer}>
          <Text style={userStyles.initialProjectLoadProfileHeaderText}>Hello, {displayName}!</Text>
          {user.email
            && (
              <Text>
                Signed in as {truncateText(user.email, 15)}
              </Text>
            )
          }
          <Button
            title={user.name ? `Not ${user.name}?` : 'Sign in?'}
            type={'clear'}
            titleStyle={{...commonStyles.standardButtonText, fontSize: 10}}
            onPress={() => {
              if (user.name) useResetState.clearUser();
              // dispatch(setSignedInStatus(false));
              closeModal();
              setVisibleInitialSection('none');
              logout();
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <Overlay
      animationType={'slide'}
      isVisible={visible}
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : overlayStyles.overlayContainer}
      backdropStyle={overlayStyles.backdropStyles}
      fullScreen={SMALL_SCREEN}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{statusMessageModalTitle}</Text>
      </View>
      {visibleInitialSection === 'none' && renderUserProfile()}
      {renderSectionView()}
    </Overlay>
  );
};

export default InitialProjectLoadModal;
