import React, {useEffect, useState} from 'react';
import {Platform, Text, TextInput, View} from 'react-native';

import moment from 'moment/moment';
import {Button, CheckBox, Dialog, Input} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {setBackupModalVisible} from '../../../../modules/home/home.slice';
import {BACKUP_TO_DEVICE, BACKUP_TO_SERVER, OVERWRITE} from '../../../../modules/project/project.constants';
import projectStyles from '../../../../modules/project/project.styles';
import useProjectHook from '../../../../modules/project/useProject';
import {STRABO_APIS} from '../../../../services/deviceAndAPI.constants';
import useExportHook from '../../../../services/useExport';
import commonStyles from '../../../common.styles';
import {isEmpty} from '../../../Helpers';
import Spacer from '../../Spacer';
import uiStyles from '../../ui.styles';
import projectOptionsModalStyle from './projectOptionsModal.style';

const ProjectOptionsDialogBox = (props) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(state => state.project.selectedProject);
  const currentProjectName = useSelector(state => state.project.project.description.project_name);
  const [checked, setChecked] = useState(1);
  const [action, setAction] = useState('');
  const [exportFileName, setExportFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOverwriteModalVisible, setIsOverwriteModalVisible] = useState(false);

  const useExport = useExportHook();
  const [useProject] = useProjectHook();

  useEffect(() => {
    console.log('Checked', checked);
    if (!isEmpty(currentProjectName)) {
      setExportFileName(moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + currentProjectName);
    }
    return () => {
      console.log('DETACHED FROM PROJECT OPTIONS MODAL');
    };
  }, [checked]);

  // const fileName = exportFileName.replace(/\s/g, '');

  const exportProject = async () => {
    const containsSpecialCharacters = validateCharacters();
    if (containsSpecialCharacters) setErrorMessage('Cannot contain special characters');
    else {
      console.log('Project has been exported to Downloads folder!');
      props.close();
      dispatch(setBackupModalVisible(true));
    }
  };

  const handleOnPress = async (action) => {
    if (action === BACKUP_TO_DEVICE) {
      await saveProject();
      console.log('Project Saved!');
    }
    else {
      props.close();
      setAction('');
      setChecked(1);
      await useProject.switchProject(action);
      console.log('Project Overwritten or Uploaded!');
    }
  };

  const goBack = () => {
    setErrorMessage('');
    setAction('');
  };

  const saveProject = async () => {
    const containsSpecialCharacters = validateCharacters();
    if (containsSpecialCharacters) setErrorMessage('Cannot contain special characters');
    else {
      console.log('Saving Project to Device');
      setErrorMessage('');
      props.close();
      await useExport.initializeBackup(exportFileName);
    }
  };

  const renderExportMessage = () => {
    if (Platform.OS === 'ios') {
      return (
        <View>
          <Text>On iOS this must be done through the Files App by moving the project.</Text>
        </View>
      );
    }
    else {
      return (
        <View>
          <Text style={commonStyles.dialogText}>
            <Text> Project will be EXPORTED to the Downloads folder in the My Files App.</Text>
          </Text>
        </View>
      );
    }
  };

  const renderActionView = () => {
    switch (checked) {
      case 1:
        return (
          <View>
            <View style={uiStyles.sectionDivider}>
              <Text style={{...commonStyles.dialogContentImportantText, color: 'black'}}>What do you want to do with the
                current project ({currentProjectName})?</Text>
            </View>
            <View style={{padding: 10}}>
              <Button
                title={'Overwrite'}
                type={'outline'}
                containerStyle={{padding: 2.5}}
                onPress={() => setAction(OVERWRITE)}
              />
              {selectedProject.source === 'server' && <Button
                title={'Save to Device'}
                type={'outline'}
                containerStyle={{padding: 2.5}}
                onPress={() => setAction(BACKUP_TO_DEVICE)}
              />}
              <Button
                title={'Upload'}
                type={'outline'}
                containerStyle={{padding: 2.5}}
                onPress={() => setAction(BACKUP_TO_SERVER)}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            {renderExportMessage()}
            <View style={projectStyles.dialogContent}>
              <TextInput
                value={exportFileName.replace(/\s/g, '')}
                onChangeText={text => setExportFileName(text)}
                style={commonStyles.dialogInputContainer}
              />
            </View>
            <View>
              <Button
                title={'Export Project to Device'}
                type={'clear'}
                onPress={() => exportProject()}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <Text>DELETE VIEW</Text>
        );
    }
  };

  const renderBackupView = () => {
    return (
      <View>
        <View style={projectStyles.dialogContent}>
          <Text style={projectOptionsModalStyle.backupViewInputHeaderText}>Dashes and underscores are allowed</Text>
          <Input
            value={exportFileName.replace(/\s/g, '')}
            onChangeText={text => setExportFileName(text)}
            containerStyle={commonStyles.dialogInputContainer}
            inputStyle={{fontSize: 14}}
            errorMessage={errorMessage}
          />
        </View>
      </View>
    );
  };

  const renderOverwriteView = () => {
    return (
      <View>
        <Text>Switching projects will
          <Text style={{color: 'red'}}> DELETE </Text>
          the local copy of the current project:
        </Text>
        <Text style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
          {props.currentProject
          && !isEmpty(props.currentProject.description) ? props.currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?
        </Text>
      </View>
    );
  };

  const renderSectionView = () => {
    switch (action) {
      case OVERWRITE:
        return (
          renderOverwriteView()
        );
      case BACKUP_TO_DEVICE:
        return (
          renderBackupView()
        );
      case BACKUP_TO_SERVER:
        return renderUploadView();
      default:
        return renderActionView();
    }
  };

  const renderUploadView = () => {
    return (
      <View>
        <View>
          <Text style={commonStyles.dialogContentImportantText}>Uploading to:</Text>
          <Text style={commonStyles.dialogContentImportantText}>
            {props.endpoint.isSelected ? props.endpoint.url : STRABO_APIS.DB}
          </Text>
        </View>
        <Spacer/>
        <Text>
          <Text style={commonStyles.dialogContentImportantText}>{!isEmpty(
            props.currentProject) && props.currentProject.description.project_name} </Text>
          project properties and datasets will be uploaded and will
          <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
          for this project:
        </Text>
      </View>
    );
  };

  const validateCharacters = (string) => {
    const format = /[`!@#$%^&*()+=[\]{};':"\\|,.<>/?~]+/;
    return format.test(exportFileName);
  };

  return (
    <View>
      <Dialog
        onBackdropPress={props.onBackdropPress}
        overlayStyle={projectOptionsModalStyle.modalContainer}
        visible={props.visible}
        useNativeDriver={true}
      >
        <Dialog.Button title={'Close'} containerStyle={{alignItems: 'flex-end'}} onPress={props.close}/>
        <Dialog.Title titleStyle={{textAlign: 'center'}} title={'Project Options for:'}/>
        <Dialog.Title titleStyle={{textAlign: 'center'}} title={`${selectedProject.project.name}`}/>
        {['Load Project', 'Export to Device', 'Delete'].map((l, i) => (
          <CheckBox
            key={i}
            title={l}
            containerStyle={{backgroundColor: 'white', borderWidth: 0}}
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={checked === i + 1}
            onPress={() => {
              setAction('');
              setChecked(i + 1);
            }}
          />))}
        <View>
          {renderSectionView()}
        </View>
        {action !== '' && <View style={projectOptionsModalStyle.sectionViewButtonContainer}>
          <Button
            title={'Cancel'}
            type={'clear'}
            onPress={() => goBack()}
          />
          <Button
            title={'Continue'}
            type={'clear'}
            onPress={() => handleOnPress(action)}
          />
        </View>}
      </Dialog>
    </View>
  );
};

export default ProjectOptionsDialogBox;
