import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Avatar, Button, Icon} from 'react-native-elements';
import {Dialog, DialogContent, DialogTitle, SlideAnimation} from 'react-native-popup-dialog';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from '../../../services/deviceAndAPI.constants';
import useDeviceHook from '../../../services/useDevice';
import {REDUX} from '../../../shared/app.constants';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import useImagesHook from '../../images/useImages';
import ActiveDatasetsList from '../../project/ActiveDatasetsList';
import DatasetList from '../../project/DatasetList';
import NewProject from '../../project/NewProjectForm';
import projectStyles from '../../project/project.styles';
import ProjectList from '../../project/ProjectList';
import {clearedDatasets, clearedProject} from '../../project/projects.slice';
import ProjectTypesButtons from '../../project/ProjectTypesButtons';
import {clearedSpots} from '../../spots/spots.slice';
import userStyles from '../../user/user.styles';
import useUserProfileHook from '../../user/useUserProfile';
import {setStatusMessageModalTitle} from '../home.slice';
import homeStyles from '../home.style';

const InitialProjectLoadModal = (props) => {
  const navigation = useNavigation();
  const activeDatasetsId = useSelector(state => state.project.activeDatasetsIds);
  const selectedProject = useSelector(state => state.project.project);
  const statusMessageModalTitle = useSelector(state => state.home.statusMessageModalTitle);
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [visibleProjectSection, setVisibleProjectSection] = useState('activeDatasetsList');
  const [visibleInitialSection, setVisibleInitialSection] = useState('none');
  const [source, setSource] = useState('');
  const [importedProjectData, setImportedProjectData] = useState({});
  const [importedImageFiles, setImportedImageFiles] = useState([]);

  const [useImages] = useImagesHook();
  const useDevice = useDeviceHook();
  const toast = useToast();
  const useUserProfile = useUserProfileHook();

  useEffect(() => {
    return () => {
      setVisibleInitialSection('none');
    };
  }, []);

  useEffect(() => {
    console.log('UE InitialProjectLoadModal [isOnline]', isOnline);
    dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
  }, [isOnline]);

  const goBack = () => {
    if (visibleProjectSection === 'activeDatasetsList') {
      dispatch(clearedProject());
      dispatch(clearedDatasets());
      dispatch(clearedSpots());
      setVisibleInitialSection(source === 'device' ? 'deviceProjects' : 'serverProjects');
      dispatch(setStatusMessageModalTitle(source === 'device'
        ? 'Projects on Device' : source === 'server' ? 'Projects on Server' : 'Welcome to StraboSpot'));
    }
    else if (visibleProjectSection === 'currentDatasetSelection') {
      setVisibleProjectSection('activeDatasetsList');
    }
  };

  const goBackToMain = () => {
    if (visibleInitialSection !== 'none') {
      setVisibleInitialSection('none');
      dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
    }
  };

  const renderProjectTypesButtons = () => {
    return (
      <View>
        <ProjectTypesButtons
          onLoadProjectsFromServer={() => handleOnPress('serverProjects')}
          onLoadProjectsFromDevice={() => handleOnPress('deviceProjects')}
          onLoadProjectsFromDownloads={() => handleOnPress('exportedProjects')}
          onStartNewProject={() => handleOnPress('project')}/>
      </View>
    );
  };

  const getExportedAndroidProject = async () => {
    try {
      const res = await useDevice.getExternalProjectData();
      console.log('EXTERNAL PROJECT', res);
      if (!isEmpty(res)) {
        dispatch(setStatusMessageModalTitle('Import Project'));
        setImportedProjectData(res);
        setVisibleInitialSection('importData');
      }
    }
    catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.warn(err.message);
        toast.show(err.message);
      }
      else {
        console.error('Error picking document!');
      }
    }

  };

  const getImageFiles = async () => {
    let imageJSONArr = [];
    const images = await useDevice.getExternalImageFiles();
    console.log('Images', images);
    images.map(async (image) => {
      await useImages.getImageFromImport(image);
      // const imageJSON = await useImages.getImageFromImport(image.uri);
      // console.log('IMAGE JSON', imageJSON);
      // imageJSONArr.push(imageJSON);
      // console.log(imageJSONArr);
    });
    // setImportedImageFiles(images);
  };

  const handleOnPress = (type) => {
    switch (type) {
      case 'serverProjects':
        setSource('server');
        setVisibleInitialSection('serverProjects');
        dispatch(setStatusMessageModalTitle('Projects on Server'));
        break;
      case 'deviceProjects':
        setSource('device');
        setVisibleInitialSection('deviceProjects');
        dispatch(setStatusMessageModalTitle('Projects on Device'));
        break;
      case 'exportedProjects':
        getExportedAndroidProject().catch(err => console.error('Error getting exported project', err));
        break;
      case 'project':
        setVisibleInitialSection('project');
        dispatch(setStatusMessageModalTitle('Start New Project'));
        break;
      default:
        setVisibleInitialSection('none');
        dispatch(setStatusMessageModalTitle('Welcome to StraboSpot'));
    }


  };

  const renderCurrentDatasetSelection = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            onPress={() => goBack()}
            type={'clear'}
          />
          <Button
            onPress={() => props.closeModal()}
            title={'Done'}
            type={'clear'}
            disabled={isEmpty(activeDatasetsId)}
            // buttonStyle={commonStyles.standardButton}
            // titleStyle={commonStyles.standardButtonText}
          />
        </View>
        <View style={{alignItems: 'center', paddingTop: 10}}>
          <Text>Select the dataset to add new spots.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <ActiveDatasetsList/>
        </View>
      </React.Fragment>
    );
  };

  const renderContinueOrCloseButton = () => {
    if (activeDatasetsId.length > 1) {
      return (
        <Button
          onPress={() => setVisibleProjectSection('currentDatasetSelection')}
          type={'clear'}
          title={'Next'}
          // buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
    else {
      return (
        <Button
          onPress={() => props.closeModal()}
          type={'clear'}
          title={'Done'}
          disabled={isEmpty(activeDatasetsId)}
          // buttonStyle={[commonStyles.standardButton]}
          titleStyle={commonStyles.standardButtonText}
        />
      );
    }
  };

  const renderDatasetList = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            onPress={() => goBack()}
            type={'clear'}
            // buttonStyle={[commonStyles.standardButton]}
            titleStyle={commonStyles.standardButtonText}
          />
          {renderContinueOrCloseButton()}
        </View>
        <Spacer/>
        <View style={commonStyles.standardButtonText}>
          <Text> By default the first dataset selected will be made the current dataset. You can change this on the next
            page and in the Active Project section of the Home Menu.</Text>
        </View>
        <Spacer/>
        <View style={{height: 400}}>
          <DatasetList/>
        </View>
      </React.Fragment>
    );
  };

  const renderListOfProjectsOnDevice = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <React.Fragment>
          <View style={{alignContent: 'center', marginTop: 10}}>
            <Button
              onPress={() => goBackToMain()}
              type={'clear'}
              icon={
                <Icon
                  name={'ios-arrow-back'}
                  type={'ionicon'}
                  color={'black'}
                  iconStyle={projectStyles.buttons}
                  size={25}
                />
              }
              containerStyle={{alignItems: 'flex-start'}}
              titleStyle={commonStyles.standardButtonText}
            />
          </View>
          {/*{renderProjectTypesButtons()}*/}
          {/*<Spacer/>*/}
          <View style={{height: 400}}>
            <ProjectList source={source}/>
          </View>
        </React.Fragment>
      );
    }
  };

  const renderListOfProjectsOnServer = () => {
    if (!isEmpty(selectedProject)) {
      return visibleProjectSection === 'activeDatasetsList' ? renderDatasetList() : renderCurrentDatasetSelection();
    }
    else {
      return (
        <View style={{alignContent: 'center', marginTop: 10}}>
          <Button
            onPress={() => goBackToMain()}
            type={'clear'}
            icon={
              <Icon
                name={'ios-arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={projectStyles.buttons}
                size={25}
              />
            }
            containerStyle={{alignItems: 'flex-start'}}
            titleStyle={commonStyles.standardButtonText}
          />
          {/*{renderProjectTypesButtons()}*/}
          <Spacer/>
          <View style={{height: 400}}>
            <ProjectList source={source}/>
          </View>
        </View>
      );
    }
  };

  const renderImagesToImport = () => {

    return (
      <View style={{}}>
        <Button
          onPress={() => goBackToMain()}
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
        <View style={{alignItems: 'flex-start'}}>
          <Text style={{}}>Import Project Images</Text>
        </View>
        <Button
          title={'Save Images to Device'}
          type={'clear'}
          onPress={() => verifyFileExistence('images')}
        />
      </View>
    );
  };

  const renderProjectToImport = () => {
    const spotCount = Object.values(importedProjectData?.spotsDb).length;
    const datasetCount = Object.values(importedProjectData?.projectDb?.datasets).length;
    return (
      <View style={{padding: 10}}>
        <Button
          onPress={() => goBackToMain()}
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
        <View style={{alignItems: 'center'}}>
          {/*<View style={{alignItems: 'flex-start', margin: 10}}>*/}
          <Text style={{}}>Selected Project to
            Import: {importedProjectData?.projectDb?.project?.description?.project_name}</Text>
          <Text style={{}}>Total Datasets: {datasetCount}</Text>
          <Text style={{textAlign: 'center'}}>Total Spots: {spotCount}</Text>
          <Button
            title={'Get Images'}
            type={'clear'}
            onPress={() => getImageFiles()}
          />
          <Text>Selected Images: {!isEmpty(importedImageFiles) ? importedImageFiles.length : 0}</Text>
        </View>
        <Button
          title={'Save to Device'}
          type={'clear'}
          containerStyle={{marginTop: 20}}
          onPress={() => verifyFileExistence('data')}
        />
      </View>
    );
  };

  const renderSectionView = () => {
    switch (visibleInitialSection) {
      case 'serverProjects':
        return (
          renderListOfProjectsOnServer()
        );
      case 'deviceProjects':
        return (
          renderListOfProjectsOnDevice()
        );
      case 'project':
        return (
          renderStartNewProject()
        );
      case 'importData':
        return (
          renderProjectToImport()
        );
      case 'importImages':
        return (
          renderImagesToImport()
        );
      default:
        return (
          renderProjectTypesButtons()
        );
    }
  };

  const renderStartNewProject = () => {
    return (
      <React.Fragment>
        <Button
          onPress={() => goBackToMain()}
          type={'clear'}
          icon={
            <Icon
              name={'ios-arrow-back'}
              type={'ionicon'}
              color={'black'}
              iconStyle={projectStyles.buttons}
              size={25}
            />
          }
          containerStyle={{alignItems: 'flex-start'}}
          titleStyle={commonStyles.standardButtonText}
        />
        <View style={{height: 400}}>
          <NewProject openMainMenu={props.openMainMenu} onPress={() => props.closeModal()}/>
        </View>
      </React.Fragment>
    );
  };

  const renderUserProfile = () => {
    return (
      <View style={{flexDirection: 'row', padding: 10, alignItems: 'center', justifyContent: 'space-evenly'}}>
        {user.name && <Avatar
          source={user.image && {uri: user.image}}
          title={useUserProfile.getUserInitials()}
          titleStyle={userStyles.avatarPlaceholderTitleStyle}
          size={80} rounded
        />}
        <View>
          <Text style={{fontSize: 22}}>Hello, {firstName}!</Text>
          <Button
            title={user.name ? `Not ${user.name}?` : 'Sign in?'}
            type={'clear'}
            titleStyle={{...commonStyles.standardButtonText, fontSize: 10}}
            onPress={() => {
              if (user.name) dispatch({type: REDUX.CLEAR_STORE});
              // dispatch(setSignedInStatus(false));
              setVisibleInitialSection('none');
              navigation.navigate('SignIn');
            }}
          />
        </View>
      </View>
    );
  };

  const saveToDevice = async (fileName) => {
    try {
      await useDevice.writeFileToDevice(APP_DIRECTORIES.BACKUP_DIR + fileName, 'data.json', importedProjectData);
      console.log('Get Images?');
      setVisibleInitialSection('importImages');
    }
    catch (err) {
      console.error('Error Writing Project Data', err);
      setVisibleInitialSection('');
      // Alert.alert('Error:', 'There is an issue writing the project data \n' + err.toString());
    }

  };

  const verifyFileExistence = async (dataType) => {
    if (dataType === 'data') {
      // const time = getTimeStamp();
      const fileName = `${importedProjectData.projectDb.project.description.project_name}`;
      const fileExists = await useDevice.doesBackupFileExist(fileName);
      if (fileExists) {
        console.log('File already exits!');
        Alert.alert('File Exists', 'A file with the name ' + fileName + ' exists already.  Saving'
          + ' this will overwrite the current one.',
          [
            {
              text: 'Cancel',
              onPress: () => goBackToMain(),
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
    else if (dataType === 'images') {

    }
  };

  const displayFirstName = () => {
    if (user.name && !isEmpty(user.name)) return user.name.split(' ')[0];
    else return 'Guest';
  };

  const firstName = displayFirstName();

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={homeStyles.dialogBox}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        dialogTitle={
          <DialogTitle
            title={statusMessageModalTitle}
            style={homeStyles.dialogTitleContainer}
            textStyle={homeStyles.dialogTitleText}
          />
        }
      >
        <DialogContent>
          {visibleInitialSection === 'none' && renderUserProfile()}
          {renderSectionView()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default InitialProjectLoadModal;
