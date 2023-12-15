import React, {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

// Styles
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import overlayStyles from '../home/overlay.styles';

const ProjectTypesButtons = (props) => {
  const user = useSelector(state => state.user);
  const deviceBackUpDirectoryExists = useSelector(state => state.project.deviceBackUpDirectoryExists);
  const downloadsDirectoryExists = useSelector(state => state.project.downloadsDirectory);

  const [backupFiles, setBackupFiles] = useState([]);
  const [exportedFiles, setExportedFiles] = useState([]);

  const useDevice = useDeviceHook();

  useEffect(() => {
    console.log('UE ProjectTypesButtons []');
    checkForFiles().catch(err => console.error('Error Checking if backup dir exists', err));
  }, []);

  const checkForFiles = async () => {
    console.log('Checking Backup Directories');
    const backupDirExists = await useDevice.doesDeviceBackupDirExist();
    console.log('PLATFORM', Platform.OS);
    if (Platform.OS === 'android') {
      const downloadsDirExists = await useDevice.doesDeviceBackupDirExist(undefined, true);
      console.log('DOWNLOADS DIR EXISTS:', downloadsDirExists);
      if (downloadsDirExists) {
        if (Platform.OS === 'android') {
          const exportFiles = await useDevice.readDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
          setExportedFiles(exportFiles);
        }
      }
    }
    if (backupDirExists) {
      const files = await useDevice.readDirectory(APP_DIRECTORIES.BACKUP_DIR);
      setBackupFiles(files);
    }
  };

  return (
    <View>
      <Button
        title={'Start a New Project'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onStartNewProject()}
      />
      {!isEmpty(user.name) && <Button
        title={'Projects From Server'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromServer()}
      />}
      {deviceBackUpDirectoryExists && <Button
        title={'Projects From Device'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromDevice()}
      />}
       <View>
          <Text style={{...overlayStyles.statusMessageText, fontWeight: 'bold'}}>When importing, select the data.json
            file
            before selecting any images or maps.</Text>
          <Button
            title={'Import Project'}
            containerStyle={commonStyles.standardButtonContainer}
            buttonStyle={commonStyles.standardButton}
            titleStyle={commonStyles.standardButtonText}
            onPress={() => props.onLoadProjectsFromDownloadsFolder()}
          />
        </View>
    </View>
  );
};

export default ProjectTypesButtons;
