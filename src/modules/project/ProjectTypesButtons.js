import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import RNFS from 'react-native-fs';
import {useSelector} from 'react-redux';

// Styles
import {APP_DIRECTORIES} from '../../services/deviceAndAPI.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';

const ProjectTypesButtons = (props) => {
  const user = useSelector(state => state.user);
  const deviceBackUpDirectoryExists = useSelector(state => state.project.deviceBackUpDirectoryExists);

  const [backupFiles, setBackupFiles] = useState([]);

  const useDevice = useDeviceHook();

  useEffect(() => {
    console.log('UE ProjectTypesButtons []');
    doesBackupDirExist().catch(err => console.error('Error Checking if backup dir exists', err));
  }, []);

  const doesBackupDirExist = async () => {
    const exists = await useDevice.doesDeviceBackupDirExist();
    if (exists) {
      const files = await RNFS.readDir(APP_DIRECTORIES.BACKUP_DIR);
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
        title={'Load a Project from Server'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromServer()}
      />}
      {deviceBackUpDirectoryExists && !isEmpty(backupFiles) && <Button
        title={'Load a Project from Device'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromDevice()}
      />}
    </View>
  );
};

export default ProjectTypesButtons;
