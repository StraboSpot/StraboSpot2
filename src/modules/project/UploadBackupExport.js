import React, {useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';

import moment from 'moment';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import Spacer from '../../shared/ui/Spacer';
import useImagesHook from '../images/useImages';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import projectStyles from './project.styles';
import UploadDialogBox from './UploadDialogBox';
import useExportHook from './useExport';
import useProjectHook from './useProject';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../home/home.slice';

const UploadBackAndExport = (props) => {
  const [useExport] = useExportHook();
  const [useProject] = useProjectHook();

  const dispatch = useDispatch();
  const datasets = useSelector(state => state.project.datasets);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds)
  const isOnline = useSelector(state => state.home.isOnline);
  const project = useSelector(state => state.project.project);

  const [dialogBoxType, setDialogBoxType] = useState(null);
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
  const [exportFileName, setExportFileName] = useState(
    moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + project.description.project_name);

  const backupToDevice = async () => {
    setIsUploadDialogVisible(false);
    dispatch(clearedStatusMessages());
    dispatch(addedStatusMessage({statusMessage: 'Backing up Project to Device...'}));
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(setStatusMessagesModalVisible(true));
    await useExport.backupProjectToDevice(exportFileName);
    console.log(`File ${exportFileName} has been backed up`);
    dispatch(addedStatusMessage({statusMessage: '---------------'}));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    await dispatch(addedStatusMessage({statusMessage: 'Project Backup Complete!'}));

  };

  const onShareProjectAsCSV = () => {
    console.log('onShareProjectAsCSV');
  };

  const onShareNotebookAsPDF = () => {
    console.log('onShareNotebookAsPDF');
  };

  const onShareProjectAsShapefile = () => {
    console.log('onShareProjectAsShapefile');
  };

  const initializeBackup = () => {
    setDialogBoxType('backup');
    setIsUploadDialogVisible(true);
  };

  const showUploadDialog = () => {
    setDialogBoxType('upload');
    setIsUploadDialogVisible(true);
  };

  const upload = async () => {
    setIsUploadDialogVisible(false);
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible(true));
    try {
      await useProject.uploadProject();
      await useProject.uploadDatasets();
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(addedStatusMessage({statusMessage: 'Upload Complete!'}));
      console.log('Upload Complete');
    }
    catch (err) {
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(addedStatusMessage({statusMessage: '----------'}));
      dispatch(addedStatusMessage({statusMessage: 'Upload Failed!'}));
      console.error('Upload Failed!');
    }
  };

  const renderUploadAndBackupButtons = () => {
    return (
      <View>
        <Button
          title={isOnline ? 'Upload project to StraboSpot' : 'Need to be ONLINE to upload'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => showUploadDialog()}
          disabled={!isOnline}
        />
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => initializeBackup()}
        />
      </View>
    );
  };

  const renderExportButtons = () => {
    return (
      <View>
        <Button
          title={'Share Notebook as PDF'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onShareNotebookAsPDF()}
        />
        <Button
          title={'Share Project as CSV'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onShareProjectAsCSV()}
        />
        <Button
          title={'Share Project as Shapefile'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onShareProjectAsShapefile()}
        />
        <View style={{alignItems: 'center', margin: 10, marginTop: 10}}>
          <Text style={commonStyles.standardDescriptionText}>Exports should not be used as the only backup. Since the
            full database cannot be reconstructed from them.</Text>
        </View>
      </View>
    );
  };

  const renderNames = (item) => {
    const name = item.name;
    const maxLength = 30;
    const truncated = name.substr(0, maxLength);
    return <Text>{name.length > maxLength ? '- ' + truncated : '- ' + name}</Text>;
  };

  const renderDialogBox = () => {
    if (dialogBoxType === 'upload') {
      const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);
      return (
        <UploadDialogBox
          dialogTitle={'OVERWRITE WARNING!'}
          visible={isUploadDialogVisible}
          cancel={() => setIsUploadDialogVisible(false)}
          buttonText={'Upload'}
          onPress={() => upload()}
        >
          <View>
            <Text>Project properties and the following active datasets will be uploaded and will
              <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
              for this project: </Text>
            <View style={{alignItems: 'center', paddingTop: 15}}>
              <FlatList
                data={activeDatasets}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => renderNames(item)}
              />
            </View>
          </View>
        </UploadDialogBox>
      );
    }
    else if (dialogBoxType === 'backup') {
      const fileName = exportFileName.replace(/\s/g, '');
      return (
        <UploadDialogBox
          dialogTitle={'Confirm or Change Folder Name'}
          visible={isUploadDialogVisible}
          cancel={() => setIsUploadDialogVisible(false)}
          onPress={() => backupToDevice()}
          buttonText={'Backup'}
          disabled={exportFileName === ''}
        >
          <View>
            <Text>If you change the folder name please do not use spaces, special characters (except a dash or
              underscore) or add a file extension.</Text>
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
    }
  };

  return (
    <React.Fragment>
      <Divider sectionText={'upload and backup'}/>
      <Spacer/>
      {renderUploadAndBackupButtons()}
      {/*<Divider sectionText={'export'}/>*/}
      {/*{renderExportButtons()}*/}
      {/*<Divider sectionText={'restore project from backup'}/>*/}
      {renderDialogBox()}
    </React.Fragment>
  );
};

export default UploadBackAndExport;
