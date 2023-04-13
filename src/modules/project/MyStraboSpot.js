import React, {useEffect, useState} from 'react';
import {Alert, Platform, View} from 'react-native';

import {Button} from 'react-native-elements';
import RNFS from 'react-native-fs';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch} from 'react-redux';

import {APP_DIRECTORIES} from '../../services/deviceAndAPI.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import Spacer from '../../shared/ui/Spacer';
import {setLoadingStatus} from '../home/home.slice';
import UserProfile from '../user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import ImportProjectAndroid from './ImportProjectAndroid';
import NewProjectForm from './NewProjectForm';
import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';

const MyStraboSpot = (props) => {
    const [showSection, setShowSection] = useState('none');
    const [importedProject, setImportedProject] = useState({});
    const [importedImageFiles, setImportedImageFiles] = useState([]);
    const dispatch = useDispatch();
    const useDevice = useDeviceHook();
    const toast = useToast();

    useEffect(() => {
      console.log('UE MyStraboSpot []');
      checkBackupDir();

    }, []);

    const checkBackupDir = async () => {
      try {
        const exists = await useDevice.doesDeviceBackupDirExist();
        console.log('Backup Directory Exists: ', exists);
        console.log('Backup Directory Path: ', RNFS);
        if (Platform.OS === 'android') {
          await checkAndroidDownloadDir();
        }
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

    const getExportedAndroidProject = async () => {
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
          Alert.alert('ERROR', err.toString());
        }
      }
    };

    const renderSectionView = () => {
      switch (showSection) {
        case 'none':
          return (
            <View style={{padding: 10}}>
              <UserProfile logout={props.logout}/>
              <Spacer/>
              <ProjectTypesButtons
                onLoadProjectsFromServer={() => setShowSection('serverProjects')}
                onLoadProjectsFromDevice={() => setShowSection('deviceProjects')}
                onLoadProjectsFromDownloadsFolder={() => getExportedAndroidProject()}
                onStartNewProject={() => setShowSection('new')}/>
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
            <ImportProjectAndroid
              importedProject={importedProject}
              visibleSection={section => setShowSection(section)}
            />
          );
        case 'new':
          return (
            <View style={{flex: 1}}>
              <NewProjectForm source={'new'}/>
            </View>
          );
      }
    };

    // const readDirectory = async () => {
    //   try {
    //     RNFS.readDir(APP_DIRECTORIES.EXPORT_FILES_ANDROID)
    //       .then((res) => {
    //         console.log('RES', res);
    //         res.map(async (x) => {
    //           console.log('File', x);
    //           // console.log('DIR', APP_DIRECTORIES.EXPORT_FILES_ANDROID + x.name);
    //           if (x.name.includes('.zip')) {
    //             console.log('Zip file', x.path);
    //           }
    //           else {
    //             console.log('Path', x.path);
    //             // console.log('data', await RNFS.readFile(APP_DIRECTORIES.BACKUP_DIR + '/' + x.name + '/data.json'));
    //             // console.log('maps', await RNFS.readdir(APP_DIRECTORIES.BACKUP_DIR + '/' + x.name + '/maps'));
    //             // console.log('images', await RNFS.readdir(APP_DIRECTORIES.BACKUP_DIR + '/' + x.name + '/Images'));
    //           }
    //
    //           // console.log('IMAGES', await RNFS.readFile(APP_DIRECTORIES.EXPORT_FILES_ANDROID + x + '/data.json'));
    //           // await RNFS.unlink(x.path);
    //           // console.log('deleted', x);
    //
    //           // const file = await RNFS.readFile(x.path + '/data.json');
    //           // console.log(file);
    //         });
    //       });
    //     // .finally(async () => {
    //     //   const y = await RNFS.readDir(APP_DIRECTORIES.EXPORT_FILES_ANDROID);
    //     //   console.log('FILES', y);
    //     // });
    //   }
    //   catch (err) {
    //     console.error('ERROR Reading', err);
    //   }
    // };

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
        {/*<Button*/}
        {/*  title={'Read Dir'}*/}
        {/*  onPress={() => readDirectory()}*/}
        {/*  type={'clear'}*/}
        {/*  containerStyle={{alignItems: 'flex-start'}}*/}
        {/*  titleStyle={commonStyles.standardButtonText}*/}
        {/*/>*/}
      </React.Fragment>
    );
  }
;

export default MyStraboSpot;
