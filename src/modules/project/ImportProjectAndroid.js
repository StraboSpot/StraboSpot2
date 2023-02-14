import React, {useState} from 'react';
import {Alert, Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from '../../services/deviceAndAPI.constants';
import useDeviceHook from '../../services/useDevice';
import useImportHook from '../../services/useImport';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {setProjectLoadSelectionModalVisible} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import projectStyles from './project.styles';

const ImportProjectAndroid = (props) => {
  const dispatch = useDispatch();
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);

  const [importedProjectData, setImportedProjectData] = useState({});
  const [importedImageFiles, setImportedImageFiles] = useState([]);
  const [importComplete, setImportComplete] = useState(false);

  // const dispatch = useDispatch();
  // const spotCount = Object.values(importedProjectData?.spotsDb).length;
  // const datasetCount = Object.values(importedProjectData?.projectDb?.datasets).length;

  const useDevice = useDeviceHook();
  const [useImages] = useImagesHook();
  const useImport = useImportHook();
  const toast = useToast();

  const getImageFiles = async () => {
    try {
      const images = await useDevice.getExternalImageFiles();
      console.log('Images', images);
      setImportedImageFiles(images);
    }
    catch (err) {
      console.error('Error getting imag files from import', err);
      if (err.code === 'DOCUMENT_PICKER_CANCELED') toast.show(err.message);
    }
  };

  const getMapTiles = () => {

  };

  const loadProject = async () => {
    try {
      dispatch(setProjectLoadSelectionModalVisible(false));
      await useImport.loadProjectFromDevice(
        {fileName: props.importedProject.projectDb.project.description.project_name});
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
    }
    catch (err) {
      console.error('Error loading imported project.', err);
    }
  };

  const renderImportComplete = () => {
    return (
      <View>
        <View style={{padding: 10}}>
          <Text style={{textAlign: 'center'}}>Project has been saved to the app under MyStraboSpot --&gt;
            Projects on Device</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Button
            title={'Go to saved projects'}
            // onPress={() => loadProject()}
            onPress={() => {
              props.source && props.source('device');
              props.visibleSection('deviceProjects');
            }}
            type={'clear'}
            containerStyle={{alignItems: 'flex-start'}}
            titleStyle={commonStyles.standardButtonText}
          />
          {isProjectLoadSelectionModalVisible && (
            <Button
              title={'Close'}
              onPress={() => dispatch(setProjectLoadSelectionModalVisible(false))}
              type={'clear'}
              containerStyle={{alignItems: 'flex-start'}}
              titleStyle={commonStyles.standardButtonText}
            />
          )
          }
        </View>
      </View>
    );
  };

  const saveToDevice = async (fileName) => {
    try {
      await useDevice.writeFileToDevice(APP_DIRECTORIES.BACKUP_DIR + fileName, 'data.json', props.importedProject);
      console.log('Saving Images...');
      importedImageFiles.map(async (image) => {
        await useImages.saveImageFromDownloadsDir(image);
        console.log(`image ${image.name} saved to app folder`);
      });
      console.log('All Images Saved!');
      // setVisibleInitialSection('importImages');
      toast.show('Data and Images Have Been Saved!');
      // props.visibleSection('importComplete');
      setImportComplete(true);
    }
    catch (err) {
      console.error('Error Writing Project Data', err);
      // props.visibleSection('');
      setImportComplete(false);
      // Alert.alert('Error:', 'There is an issue writing the project data \n' + err.toString());
    }
  };

  const verifyFileExistence = async (dataType) => {
    if (dataType === 'data') {
      // const time = getTimeStamp();
      const fileName = props.importedProject.projectDb.project.description.project_name;
      const fileExists = await useDevice.doesBackupFileExist(fileName);
      if (fileExists) {
        console.log('File already exits!');
        Alert.alert('File Exists', 'A file with the name ' + fileName + ' exists already.  Saving'
          + ' this will overwrite the current one.',
          [
            {
              text: 'Cancel',
              onPress: () => props.goBackToMain(),
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => saveToDevice(fileName),
              style: 'cancel',
            },
          ]);
      }
      else {
        await useDevice.makeDirectory(APP_DIRECTORIES.BACKUP_DIR + fileName);
        await saveToDevice(fileName);
      }
    }
  };

  return (
    <View style={{padding: 10}}>
      {isProjectLoadSelectionModalVisible
        && (
          <Button
            onPress={() => props.goBackToMain()}
            type={'clear'}
            // title={'Back'}
            titleStyle={commonStyles.standardButtonText}
            containerStyle={{alignItems: 'flex-start'}}
            icon={
              <Icon
                name={'ios-arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={projectStyles.buttons}
                size={25}
              />
            }
          />
        )
      }


      {importComplete ? renderImportComplete()
        : (
          <View style={{alignItems: 'center'}}>
            {/*<View style={{alignItems: 'flex-start', margin: 10}}>*/}
            <Text style={{fontWeight: 'bold'}}>Selected Project to Import:</Text>
            <Text>{props.importedProject?.projectDb?.project?.description?.project_name}</Text>
            <View style={{padding: 10, alignItems: 'center'}}>
              <Text style={{}}>Total Datasets: {Object.values(props.importedProject?.projectDb.datasets).length}</Text>
              <Text style={{}}>Total Spots: {Object.values(props.importedProject?.spotsDb).length}</Text>
            </View>
            <Text style={{...commonStyles.dialogText, fontWeight: 'bold'}}>In My Files hold down on one image to select
              multiple.</Text>
            <Button
              title={'Get Images'}
              type={'clear'}
              onPress={() => getImageFiles()}
            />
            {!isEmpty(importedImageFiles) && <Text>Selected Images: {importedImageFiles.length}</Text>}
            <Button
              title={'Get Map Tiles?'}
              type={'clear'}
              onPress={() => getMapTiles()}
            />
            <Button
              title={'Save'}
              type={'clear'}
              containerStyle={{marginTop: 20}}
              onPress={() => verifyFileExistence('data')}
            />
          </View>
        )
      }
    </View>
  );
};

export default ImportProjectAndroid;
