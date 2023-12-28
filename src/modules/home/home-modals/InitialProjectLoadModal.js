import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import {REDUX} from '../../../shared/app.constants';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import modalStyle from '../../../shared/ui/modal/modal.style';
import Spacer from '../../../shared/ui/Spacer';
import ActiveDatasetsList from '../../project/ActiveDatasetsList';
import DatasetList from '../../project/DatasetList';
import ImportProjectFromZip from '../../project/ImportProjectFromZip';
import NewProject from '../../project/NewProjectForm';
import projectStyles from '../../project/project.styles';
import ProjectList from '../../project/ProjectList';
import {clearedDatasets, clearedProject} from '../../project/projects.slice';
import ProjectTypesButtons from '../../project/ProjectTypesButtons';
import {clearedSpots} from '../../spots/spots.slice';
import userStyles from '../../user/user.styles';
import useUserProfileHook from '../../user/useUserProfile';
import {setLoadingStatus, setStatusMessageModalTitle} from '../home.slice';
import overlayStyles from '../overlay.styles';

const InitialProjectLoadModal = ({closeModal, logout, openMainMenu, visible}) => {
  console.log('Rendering InitialProjectLoadModal...');

  const displayFirstName = () => {
    if (user.name && !isEmpty(user.name)) return user.name.split(' ')[0];
    else return 'Guest';
  };

  const activeDatasetsId = useSelector(state => state.project.activeDatasetsIds);
  const selectedProject = useSelector(state => state.project.project);
  const statusMessageModalTitle = useSelector(state => state.home.statusMessageModalTitle);
  const isOnline = useSelector(state => state.connections.isOnline);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [displayName, setDisplayName] = useState('');
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');
  const [source, setSource] = useState('');
  const [importedProjectData, setImportedProjectData] = useState({});
  const [importedImageFiles, setImportedImageFiles] = useState([]);
  const [importComplete, setImportComplete] = useState(false);

  const useDevice = useDeviceHook();
  const toast = useToast();
  const useUserProfile = useUserProfileHook();

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

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch(clearedProject());
      dispatch(clearedDatasets());
      dispatch(clearedSpots());
      setVisibleInitialSection(source === 'device' ? 'deviceProjects' : 'serverProjects');
      setImportedImageFiles([]);
      dispatch(setStatusMessageModalTitle(source === 'device'
        ? 'Projects on Device' : source === 'server' ? 'Projects on Server' : 'Welcome to StraboSpot'));
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const goBackToMain = () => {
    if (visibleInitialSection !== 'none') {
      setVisibleInitialSection('none');
      setImportedImageFiles([]);
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

  const renderCurrentDatasetSelection = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            onPress={() => goBack()}
            type={'clear'}
          />
          <Button
            onPress={() => closeModal()}
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
          onPress={() => closeModal()}
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
      case 'importData':
        return (
          <ImportProjectFromZip
            visibleSection={section => setVisibleInitialSection(section)}
            goBackToMain={() => goBackToMain()}
            source={source => setSource(source)}
            importedProject={importedProjectData}
            setImportComplete={value => setImportComplete(value)}
            importComplete={importComplete}
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
      <React.Fragment>
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
          <NewProject openMainMenu={openMainMenu} onPress={() => closeModal()}/>
        </View>
      </React.Fragment>
    );
  };

  const renderUserProfile = () => {
    return (
      <View style={{flexDirection: 'row', padding: 10, alignItems: 'center', justifyContent: 'space-evenly'}}>
        {user.name && <Avatar
          source={user.image && {uri: user.image}}
          title={useUserProfile.getInitials()}
          titleStyle={userStyles.avatarPlaceholderTitleStyle}
          size={80} rounded
        />}
        <View>
          <Text style={{fontSize: 22}}>Hello, {displayName}!</Text>
          <Button
            title={user.name ? `Not ${user.name}?` : 'Sign in?'}
            type={'clear'}
            titleStyle={{...commonStyles.standardButtonText, fontSize: 10}}
            onPress={() => {
              if (user.name) dispatch({type: REDUX.CLEAR_STORE});
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
      overlayStyle={SMALL_SCREEN ? modalStyle.modalContainerFullScreen : overlayStyles.overlayContainer}
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
