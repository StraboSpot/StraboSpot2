import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch} from 'react-redux';

import ActiveProjectList from './ActiveProjectList';
import ImportProjectFromZip from './ImportProjectFromZip';
import NewProjectForm from './NewProjectForm';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import Spacer from '../../shared/ui/Spacer';
import {setLoadingStatus} from '../home/home.slice';
import UserProfile from '../user/UserProfile';

const MyStraboSpot = ({logout, openMainMenu}) => {
  const [showSection, setShowSection] = useState('none');
  const [importedProject, setImportedProject] = useState({});
  const [importComplete] = useState(false);
  const dispatch = useDispatch();
  const useDevice = useDeviceHook();
  const toast = useToast();

  useEffect(() => {
    console.log('UE MyStraboSpot []');
    if (Platform.OS !== 'web') checkBackupDir().catch(err => console.error('Error checking for backup dir', err));
  }, []);

  const checkBackupDir = async () => {
    try {
      const exists = await useDevice.doesDeviceBackupDirExist();
      console.log('Backup Directory Exists: ', exists);
      if (Platform.OS === 'android') await checkAndroidDownloadDir();
      console.log('ALL DONE');
    }
    catch (err) {
      console.error('Error Checking If Backup Dir Exists', err);
    }
  };

  const checkAndroidDownloadDir = async () => {
    const exists = await useDevice.doesDeviceBackupDirExist(undefined, true);
    if (!exists) await useDevice.makeDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
  };

  const getExportedProject = async () => {
    try {
      dispatch(setLoadingStatus({bool: true, view: 'home'}));
      const res = await useDevice.getExternalProjectData();
      console.log('EXTERNAL PROJECT', res);
      if (!isEmpty(res)) {
        // dispatch(setStatusMessageModalTitle('Import Project'));
        setImportedProject(res);
        setShowSection('importData');
        dispatch(setLoadingStatus({bool: false, view: 'home'}));
      }
    }
    catch (err) {
      dispatch(setLoadingStatus({bool: false, view: 'home'}));
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.warn(err.message);
        toast.show(err.message);
      }
      else {
        console.error('Error picking document!', err);
        alert('ERROR', err.toString());
      }
    }
  };

  const handleImportComplete = (value) => {
    console.log('ImportComplete value', value);
    dispatch(setLoadingStatus({bool: false, view: 'home'}));
    setShowSection('deviceProjects');
  };

  const renderSectionView = () => {
    switch (showSection) {
      case 'none':
        return (
          <View style={{padding: 10}}>
            <UserProfile logout={logout}/>
            {Platform.OS !== 'web' && (
              <>
                <Spacer/>
                <ProjectTypesButtons
                  onLoadProjectsFromServer={() => setShowSection('serverProjects')}
                  onLoadProjectsFromDevice={() => setShowSection('deviceProjects')}
                  onLoadProjectsFromDownloadsFolder={() => getExportedProject()}
                  onStartNewProject={() => setShowSection('new')}
                />
              </>
            )}
          </View>
        );
      case 'serverProjects':
        return (
          <View style={{flex: 1}}>
            <ProjectList source={'server'}/>
            <ActiveProjectList/>
          </View>
        );
      case 'deviceProjects':
        return (
          <View style={{flex: 1}}>
            <ProjectList source={'device'}/>
            <View style={{marginBottom: 20}}>
              <ActiveProjectList/>
              {Platform.OS === 'ios' && <Button
                title={'View/Edit Files on Device'}
                type={'outline'}
                containerStyle={commonStyles.buttonPadding}
                buttonStyle={commonStyles.standardButton}
                titleStyle={commonStyles.standardButtonText}
                onPress={() => useDevice.openURL('ProjectBackups')}
                iconContainerStyle={{paddingRight: 10}}
                icon={{
                  name: 'file-tray-full-outline',
                  type: 'ionicon',
                  color: BLUE,
                }}
              />}
            </View>
          </View>
        );
      case 'importData':
        return (
          <ImportProjectFromZip
            importedProject={importedProject}
            visibleSection={section => setShowSection(section)}
            setImportComplete={handleImportComplete}
            importComplete={importComplete}
            setLoading={value => dispatch(setLoadingStatus({bool: value, view: 'home'}))} //TODO: Check to see if this can be removed or used else where
          />
        );
      case 'new':
        return (
          <View style={{flex: 1}}>
            <NewProjectForm openMainMenu={openMainMenu} source={'new'}/>
          </View>
        );
    }
  };

  return (
    <React.Fragment>
      <View style={{alignItems: 'flex-start'}}>
        {showSection !== 'none' && (
          <Button
            title={'Back to My StraboSpot'}
            titleStyle={commonStyles.standardButtonText}
            type={'clear'}
            onPress={() => setShowSection('none')}
            icon={{
              name: 'chevron-back-outline',
              type: 'ionicon',
              size: 20,
              color: BLUE,
            }}
          />
        )}
      </View>
      {renderSectionView()}
    </React.Fragment>
  );
};

export default MyStraboSpot;
