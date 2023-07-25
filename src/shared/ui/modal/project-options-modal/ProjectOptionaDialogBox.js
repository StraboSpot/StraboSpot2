import React, {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';

import LottieView from 'lottie-react-native';
import moment from 'moment/moment';
import {Button, CheckBox, Dialog, Input} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {setLoadingStatus, setProgressModalVisible} from '../../../../modules/home/home.slice';
import {BACKUP_TO_DEVICE, BACKUP_TO_SERVER, OVERWRITE} from '../../../../modules/project/project.constants';
import projectStyles from '../../../../modules/project/project.styles';
import {setSelectedProject} from '../../../../modules/project/projects.slice';
import useProjectHook from '../../../../modules/project/useProject';
import {APP_DIRECTORIES} from '../../../../services/directories.constants';
import {STRABO_APIS} from '../../../../services/urls.constants';
import useDeviceHook from '../../../../services/useDevice';
import useExportHook from '../../../../services/useExport';
import commonStyles from '../../../common.styles';
import {isEmpty} from '../../../Helpers';
import Spacer from '../../Spacer';
import uiStyles from '../../ui.styles';
import useAnimationsHook from '../../useAnimations';
import projectOptionsModalStyle from './projectOptionsModal.style';

const ProjectOptionsDialogBox = (props) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(state => state.project.selectedProject);
  const currentProjectName = useSelector(state => state.project.project?.description?.project_name);

  const [checked, setChecked] = useState(1);
  const [deletingProjectStatus, setDeletingProjectStatus] = useState('');
  const [action, setAction] = useState('');
  const [backupFileName, setBackupFileName] = useState('');
  const [exportFileName, setExportFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMapTiles, setIncludeMapTiles] = useState(true);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [isOverwriteModalVisible, setIsOverwriteModalVisible] = useState(false);
  const [passwordInputVal, setPasswordTextInputVal] = useState('');
  // const [projectsArr, setProjectsArr] = useState([]);
  const [projectNameToDelete, setProjectNameToToDelete] = useState('');

  const useAnimations = useAnimationsHook();
  const useDevice = useDeviceHook();
  const useExport = useExportHook();
  const [useProject] = useProjectHook();
  const toast = useToast();

  useEffect(() => {
    console.log('Images Included:', includeImages);
    console.log('Maps Included:', includeMapTiles);
  }, [includeImages, includeMapTiles]);

  useEffect(() => {
    if (!isEmpty(currentProjectName)) {
      setBackupFileName(moment(new Date()).format('YYYY-MM-DD_hmma') + '_' + currentProjectName);
      setExportFileName(`${selectedProject?.project?.fileName}_(EXP-${moment(new Date()).format('YYYY-MM-DD_hmma')})`);
    }
  }, [checked]);

  const deleteProjectFromLocalStorage = async () => {
    try {
      setDeletingProjectStatus('deleting');
      setProgressModalVisible(true);
      props.close();
      setDeletingProjectStatus('deleting');
      setIsProgressModalVisible(true);
      setTimeout(async () => {
        setChecked(1);
        await useDevice.deleteProjectOnDevice(APP_DIRECTORIES.BACKUP_DIR, selectedProject.project.fileName);
        setDeletingProjectStatus('complete');
        props.projectDeleted(true);
      }, 1000);
    }
    catch (err) {
      console.error('Error deleting project!', err);
      setDeleteErrorMessage(err.toString());
      toast.show(`${selectedProject.project.fileName} does not exist!`, {type: 'danger'});
      setChecked(3);
    }
  };

  const exportProject = async () => {
    try {
      console.log('FileName', exportFileName);
      props.close();
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      await useExport.zipAndExportProjectFolder(selectedProject.project.fileName, exportFileName, true);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      console.log('Project has been exported to Downloads folder!');
      toast.show('Project has been exported!');
      setChecked(1);
      setIncludeMapTiles(true);
      setIncludeImages(true);
    }
    catch (err) {
      console.error('Error exporting project!', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show('EXPORT FAILED!! \nProject has to have a unique name!');
    }
  };

  const handleOnPress = async (action) => {
    if (action === BACKUP_TO_DEVICE) {
      await saveProject();
      console.log('Project Saved!');
    }
    else if (action === OVERWRITE) {
      props.close();
      await useProject.switchProject(OVERWRITE);
      console.log('Project overwritten!');
    }
    else {
      props.close();
      setAction('');
      setChecked(1);
      dispatch(setProgressModalVisible(true));
      // console.log('Project Overwritten or Uploaded!');
    }
  };

  const goBack = () => {
    setErrorMessage('');
    setAction('');
  };

  const onClose = () => {
    dispatch(setSelectedProject({project: {}, source: ''}));
    setChecked(1);
    setAction('');
    setIncludeMapTiles(true);
    setIncludeImages(true);
    props.close();
  };

  const saveProject = async () => {
    const containsSpecialCharacters = validateCharacters();
    if (containsSpecialCharacters) setErrorMessage('Cannot contain special characters');
    else {
      console.log('Saving Project to Device');
      setErrorMessage('');
      props.close();
      await useExport.initializeBackup(backupFileName);
    }
  };

  const renderExportMessage = () => {
    if (Platform.OS === 'ios') {
      return (
        <View>
          <Text>All project data, images, and offline maps will be EXPORTED as a .ZIP file to the Distribution folder in
            the My Files App &gt; StraboSpot2 &gt; ProjectBackups &gt; Distribution.</Text>
        </View>
      );
    }
    else {
      return (
        <View>
          <Text style={commonStyles.dialogText}>
            <Text> All project data, images, and offline maps will be EXPORTED as a .ZIP file to the Downloads folder in
              the My Files App.</Text>
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
              <Text style={{...commonStyles.dialogContentImportantText, color: 'black'}}>What do you want to do with
                the
                current project ({currentProjectName})?</Text>
            </View>
            <View style={{padding: 10}}>
              {selectedProject.source !== 'new' && <Button
                title={'Overwrite'}
                type={'outline'}
                containerStyle={{padding: 2.5}}
                onPress={() => setAction(OVERWRITE)}
              />}
              <Button
                title={'Save to Device'}
                type={'outline'}
                containerStyle={{padding: 2.5}}
                onPress={() => setAction(BACKUP_TO_DEVICE)}
              />
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
        return renderDeleteView();
      case 3:
        return (
          <View>
            {renderExportMessage()}
            <View style={projectStyles.dialogContent}>
              <Text>Project will be exported as: {exportFileName}</Text>
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
    }
  };

  const renderBackupView = () => {
    return (
      <View>
        <View style={projectStyles.dialogContent}>
          <Text style={commonStyles.dialogConfirmText}>Saves current project to local storage.</Text>
          <Text style={projectOptionsModalStyle.backupViewInputHeaderText}>Dashes and underscores are allowed</Text>
          <Input
            value={backupFileName.replace(/\s/g, '')}
            onChangeText={text => setBackupFileName(text)}
            containerStyle={commonStyles.dialogInputContainer}
            inputStyle={{fontSize: 14}}
            errorMessage={errorMessage}
          />
        </View>
      </View>
    );
  };

  const renderDeleteView = () => {
    const projectName = selectedProject?.project.fileName;
    return (
      <View>
        <View>
          <Text style={commonStyles.dialogContentImportantText}>Are you sure you want to
            delete{'\n' + projectName}?
          </Text>
          <Text style={commonStyles.dialogConfirmText}>This will
            <Text style={commonStyles.dialogContentImportantText}> ERASE </Text>
            the backed up version of this project LOCALLY including Spots, images, and all other data!
          </Text>
        </View>
        <Button
          title={'DELETE'}
          titleStyle={projectOptionsModalStyle.deleteButtonText}
          buttonStyle={projectOptionsModalStyle.deleteButtonContainer}
          type={'clear'}
          onPress={() => deleteProjectFromLocalStorage(projectName)}
        />
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
          <Text style={commonStyles.dialogContentImportantText}>Uploading {'\n'}{!isEmpty(
            props.currentProject) && props.currentProject.description.project_name} {'\n'}to:</Text>
          <Text style={commonStyles.dialogContentImportantText}>
            {props.endpoint?.isSelected ? props.endpoint.url : STRABO_APIS.DB}
          </Text>
        </View>
        <Spacer/>
        <Text>
          <Text style={commonStyles.dialogContentImportantText}> </Text>
          project properties and datasets will be uploaded and will
          <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
          for this project:
        </Text>
      </View>
    );
  };

  const validateCharacters = (string) => {
    const format = /[`!@#$%^&*()+=[\]{};':"\\|,.<>/?~]+/;
    return format.test(backupFileName);
  };

  const radioButtonArr = ['Load Project', 'Delete', 'Export'];
  // const displayedButtons = selectedProject.source === 'device' && Platform.OS === 'ios' ? radioButtonArr.slice(0,
  //   2) : radioButtonArr;
  const showExportChoice = selectedProject.source === 'device';
  const header = selectedProject.source === 'device' ? 'Selected Device Project:' : selectedProject.source === 'server'
    ? 'Selected Server Project:' : null;
  const projectName = `${selectedProject.source === 'server' ? selectedProject.project.name : selectedProject.source === 'device'
    ? selectedProject.project.fileName : 'New Project'}`;
  return (
    <View>
      <Dialog
        overlayStyle={projectOptionsModalStyle.modalContainer}
        isVisible={props.visible}
        useNativeDriver={true}
      >
        <Dialog.Button title={'Close'} containerStyle={{alignItems: 'flex-end'}} onPress={() => onClose()}/>
        <Dialog.Title titleStyle={{textAlign: 'center'}} title={header}/>
        <Dialog.Title
          titleStyle={{textAlign: 'center'}}
          title={projectName}
        />
        {selectedProject.source === 'new'
          && <Text style={{textAlign: 'center', color: 'red'}}>Starting a new project will overwrite the current
            project. Press Close if that is ok.</Text>}
        {showExportChoice && radioButtonArr.map((l, i) => (
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
      <Dialog
        isVisible={isProgressModalVisible}
        overlayStyle={projectOptionsModalStyle.modalContainer}
        useNativeDriver={true}

      >
        <Dialog.Title titleStyle={{textAlign: 'center'}} title={'Deleting...'}/>
        <View style={{alignItems: 'center'}}>
          {deletingProjectStatus !== 'complete'
            ? <Text style={projectOptionsModalStyle.projectNameText}>Deleting {projectNameToDelete}</Text>
            : <Text style={projectOptionsModalStyle.projectNameText}>{projectNameToDelete} has been deleted.</Text>
          }
          <LottieView
            style={{width: 200, height: 200}}
            source={useAnimations.getAnimationType(
              deletingProjectStatus === 'deleting' ? 'deleteProject' : 'complete')}
            autoPlay
            loop={deletingProjectStatus === 'deleteProject'}
          />
        </View>
        {deletingProjectStatus === 'complete' && <Dialog.Button
          title={'Close'}
          onPress={() => setIsProgressModalVisible(false)}
        />}
      </Dialog>
    </View>
  );
};

export default ProjectOptionsDialogBox;
