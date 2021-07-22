import React, {useEffect, useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';

import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';

import useExportHook from '../../../services/useExport';
import commonStyles from '../../../shared/common.styles';
import {isEmpty, truncateText} from '../../../shared/Helpers';
import projectStyles from '../../project/project.styles';
import UploadDialogBox from '../../project/UploadDialogBox';
import useProjectHook from '../../project/useProject';
import {setBackupModalVisible} from '../home.slice';

const BackupModal = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const isBackModalVisible = useSelector(state => state.home.isBackupModalVisible);
  const [exportFileName, setExportFileName] = useState('');

  const useExport = useExportHook();
  const [useProject] = useProjectHook();

  useEffect(() => {
    if (!isEmpty(currentProject)) {
      setExportFileName(moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + currentProject.description.project_name);
    }
  }, [currentProject, user]);

  const fileName = exportFileName.replace(/\s/g, '');

  const renderDatasetNames = () => {
    const activeDatasets = useProject.getActiveDatasets();
    return (
      <FlatList
        data={activeDatasets}
        renderItem={({item}) =>
          <Text>{item.name.length > 30 ? '- ' + truncateText(item.name, 30)
            : '- ' + item.name}</Text>
        }
      />
    );
  };

  return (
    <UploadDialogBox
      dialogTitle={'Confirm or Change Folder Name'}
      visible={isBackModalVisible}
      cancel={() => dispatch(setBackupModalVisible(false))}
      onPress={() => useExport.initializeBackup(exportFileName)}
      buttonText={'Backup'}
      disabled={exportFileName === ''}
    >
      <View>
        <View>
          <Text style={commonStyles.dialogText}>
            <Text style={commonStyles.dialogContentImportantText}>ALL</Text>
            <Text> datasets, active and inactive, will be
              exported along with the images, and custom maps.</Text>
          </Text>
          <Text style={commonStyles.dialogText}>If you change the folder name please do not use spaces, special
            characters (except a dash or
            underscore), or add a file extension.</Text>
        </View>
        <View style={projectStyles.dialogContent}>
          <TextInput
            value={fileName}
            onChangeText={text => setExportFileName(text)}
            style={commonStyles.dialogInputContainer}
          />
        </View>
      </View>
    </UploadDialogBox>
  );
};

export default BackupModal;
