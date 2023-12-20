import React, {useEffect, useState} from 'react';
import {Text, TextInput, View} from 'react-native';

import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';

import useExportHook from '../../../services/useExport';
import {isEmpty} from '../../../shared/Helpers';
import UploadDialogBox from '../../project/UploadDialogBox';
import {setBackupModalVisible} from '../home.slice';
import overlayStyles from '../overlays/overlay.styles';

const BackupModal = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const isBackModalVisible = useSelector(state => state.home.isBackupModalVisible);
  const [backupFileName, setBackupFileName] = useState('');

  const useExport = useExportHook();

  useEffect(() => {
    console.log('UE BackupModal [currentProject, user]', currentProject, user);
    if (!isEmpty(currentProject) && isBackModalVisible) {
      setBackupFileName(moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + currentProject.description.project_name);
    }
  }, [currentProject, isBackModalVisible]);

  const fileName = backupFileName.replace(/\s/g, '');

  return (
    <UploadDialogBox
      dialogTitle={'Confirm or Change Folder Name'}
      visible={isBackModalVisible}
      cancel={() => dispatch(setBackupModalVisible(false))}
      onPress={() => useExport.initializeBackup(backupFileName)}
      buttonText={'Backup'}
      disabled={backupFileName === ''}
    >
      <View>
        <View>
          <Text style={overlayStyles.contentText}>
            <Text style={overlayStyles.importantText}>ALL</Text>
            <Text> datasets, active and inactive, will be
              exported along with the images, and custom maps.</Text>
          </Text>
          <Text style={overlayStyles.contentText}>If you change the folder name please do not use spaces, special
            characters (except a dash or
            underscore), or add a file extension.</Text>
        </View>
        <View style={overlayStyles.overlayContent}>
          <TextInput
            value={fileName || ''}
            onChangeText={text => setBackupFileName(text)}
            style={overlayStyles.inputContainer}
          />
        </View>
      </View>
    </UploadDialogBox>
  );
};

export default BackupModal;
