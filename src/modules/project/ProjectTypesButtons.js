import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

// Styles
import {APP_DIRECTORIES} from '../../services/deviceAndAPI.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';

const ProjectTypesButtons = (props) => {
  const user = useSelector(state => state.user);
  const deviceBackUpDirectoryExists = useSelector(state => state.project.deviceBackUpDirectoryExists);
  const downloadsDirectory = useSelector(state => state.project.downloadsDirectory);

  const [backupFiles, setBackupFiles] = useState([]);
  const [exportedFiles, setExportedFiles] = useState([]);

  const useDevice = useDeviceHook();

  useEffect(() => {
    console.log('UE ProjectTypesButtons []');
    doesBackupDirExist().catch(err => console.error('Error Checking if backup dir exists', err));
  }, []);

  const doesBackupDirExist = async () => {
    const backupDirExists = await useDevice.doesDeviceBackupDirExist();
    const downloadsDirExists = await useDevice.doesDeviceBackupDirExist(undefined, true);
    if (backupDirExists) {
      const files = await useDevice.readDirectory(APP_DIRECTORIES.BACKUP_DIR);
      setBackupFiles(files);
    }
    if (downloadsDirExists) {
      const exportFiles = await useDevice.readDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
      console.log(exportFiles);
      setExportedFiles(exportFiles);
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
      {deviceBackUpDirectoryExists && !isEmpty(backupFiles) && <Button
        title={'Projects From Device'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromDevice()}
      />}
      {Platform.OS === 'android' && downloadsDirectory && !isEmpty(exportedFiles) && <Button
        title={'Projects to Import'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromDownloads()}
      />}
    </View>
  );
};

export default ProjectTypesButtons;
